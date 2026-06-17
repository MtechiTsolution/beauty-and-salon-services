import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { query } from '../db.js';
import { createChatForBooking } from '../lib/booking-chat.js';
import {
  notifyBookingCreated,
  notifyBookingPaymentChange,
  notifyBookingStatusChange,
  type BookingNotificationRow,
} from '../lib/notifications.js';
import { newId, rowDates } from '../utils.js';

function mapBooking(row: Record<string, unknown>) {
  const mapped = rowDates({
    ...row,
    date: row.booking_date,
    price: Number(row.price),
    discount: Number(row.discount),
    final_price: Number(row.final_price),
    duration_minutes: Number(row.duration_minutes),
  });
  delete (mapped as Record<string, unknown>).booking_date;
  return mapped;
}

export const bookingsRouter = Router();

bookingsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { customer_email, date, employee_id, status, branch_id } = req.query;
    let sql = 'SELECT * FROM bookings WHERE 1=1';
    const params: unknown[] = [];
    if (customer_email) {
      sql += ' AND customer_email = ?';
      params.push(customer_email);
    }
    if (branch_id && typeof branch_id === 'string') {
      sql += ' AND branch_id = ?';
      params.push(branch_id);
    }
    if (date) {
      sql += ' AND booking_date = ?';
      params.push(date);
    }
    if (employee_id) {
      sql += ' AND employee_id = ?';
      params.push(employee_id);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY booking_date DESC, time_slot';
    const rows = await query<Record<string, unknown>[]>(sql, params);
    res.json(rows.map(mapBooking));
  }),
);

bookingsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(mapBooking(rows[0]));
  }),
);

bookingsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const b = req.body;

    const durationMinutes = Number(b.duration_minutes);
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return res.status(400).json({ message: 'duration_minutes must be a positive number' });
    }

    const { assertActiveBookingSchedule } = await import('../lib/bookingConflict.js');
    await assertActiveBookingSchedule({
      employeeId: String(b.employee_id),
      date: String(b.date),
      timeSlot: String(b.time_slot),
      durationMinutes,
      status: String(b.status ?? 'pending'),
    });

    if (b.coupon_code) {
      const { validateCouponForCustomer, redeemCoupon, couponRejectMessage } = await import(
        '../lib/couponValidation.js'
      );
      const validation = await validateCouponForCustomer(
        String(b.coupon_code),
        String(b.customer_email),
        b.price != null ? Number(b.price) : undefined,
      );
      if (!validation.ok) {
        return res.status(400).json({ message: couponRejectMessage(validation.reason) });
      }
      await redeemCoupon(validation.coupon.id as string);
    }

    const id = newId();
    await query(
      `INSERT INTO bookings (
      id, customer_email, customer_name, branch_id, branch_name, service_id, service_title,
      employee_id, employee_name, booking_date, time_slot, duration_minutes, price, discount,
      final_price, coupon_code, status, payment_status, payment_method, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        b.customer_email,
        b.customer_name,
        b.branch_id,
        b.branch_name,
        b.service_id,
        b.service_title,
        b.employee_id,
        b.employee_name,
        b.date,
        b.time_slot,
        b.duration_minutes,
        b.price,
        b.discount ?? 0,
        b.final_price,
        b.coupon_code ?? null,
        b.status ?? 'pending',
        b.payment_status ?? 'unpaid',
        b.payment_method ?? null,
        b.notes ?? null,
      ],
    );
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM bookings WHERE id = ?', [id]);
    const created = rows[0];
    await notifyBookingCreated(created as BookingNotificationRow);
    await createChatForBooking({
      id: String(created.id),
      customer_email: String(created.customer_email),
      customer_name: String(created.customer_name),
      branch_id: String(created.branch_id),
      branch_name: String(created.branch_name),
      service_title: String(created.service_title),
      booking_date: created.booking_date as string | Date,
      time_slot: String(created.time_slot),
    });
    res.status(201).json(mapBooking(created));
  }),
);

bookingsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const b = req.body;
    const beforeRows = await query<Record<string, unknown>[]>(
      'SELECT * FROM bookings WHERE id = ?',
      [req.params.id],
    );
    if (!beforeRows[0]) return res.status(404).json({ message: 'Not found' });
    const before = beforeRows[0];

    if (b.status === 'cancelled') {
      const currentStatus = String(before.status);
      if (!['pending', 'confirmed'].includes(currentStatus)) {
        return res.status(400).json({ message: 'This booking cannot be cancelled' });
      }
      const { resolvePaymentStatusOnCancel } = await import('../../../shared/src/lib/booking-payment.js');
      const refunded = resolvePaymentStatusOnCancel(String(before.payment_status), true);
      if (refunded) {
        b.payment_status = refunded;
      }
    }

    if (b.payment_status !== undefined && b.payment_status !== before.payment_status) {
      const previous = String(before.payment_status);
      const next = String(b.payment_status);
      if (previous === 'paid' && next === 'refunded' && b.status === 'cancelled') {
        /* auto-refund on cancellation */
      } else if (previous === 'paid') {
        return res.status(400).json({ message: 'Payment cannot be changed once marked as paid' });
      } else if (previous === 'refunded') {
        return res.status(400).json({ message: 'Refunded payments cannot be changed' });
      } else if (previous === 'unpaid' && next !== 'paid') {
        return res.status(400).json({ message: 'Unpaid bookings can only be marked as paid' });
      }
    }

    const nextStatus = b.status !== undefined ? String(b.status) : String(before.status);
    const nextEmployeeId =
      b.employee_id !== undefined ? String(b.employee_id) : String(before.employee_id);
    const nextDate =
      b.date !== undefined
        ? String(b.date)
        : String(before.booking_date).slice(0, 10);
    const nextTimeSlot =
      b.time_slot !== undefined ? String(b.time_slot) : String(before.time_slot);
    const nextDuration =
      b.duration_minutes !== undefined
        ? Number(b.duration_minutes)
        : Number(before.duration_minutes);

    if (b.duration_minutes !== undefined && (!Number.isFinite(nextDuration) || nextDuration <= 0)) {
      return res.status(400).json({ message: 'duration_minutes must be a positive number' });
    }

    const scheduleTouched =
      b.employee_id !== undefined ||
      b.date !== undefined ||
      b.time_slot !== undefined ||
      b.duration_minutes !== undefined;
    const reactivated =
      b.status !== undefined &&
      nextStatus !== 'cancelled' &&
      String(before.status) === 'cancelled';

    if (nextStatus !== 'cancelled' && (scheduleTouched || reactivated)) {
      const { assertActiveBookingSchedule } = await import('../lib/bookingConflict.js');
      await assertActiveBookingSchedule({
        employeeId: nextEmployeeId,
        date: nextDate,
        timeSlot: nextTimeSlot,
        durationMinutes: nextDuration || 30,
        status: nextStatus,
        excludeBookingId: req.params.id,
      });
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, string> = {
      status: 'status',
      payment_status: 'payment_status',
      payment_method: 'payment_method',
      notes: 'notes',
      date: 'booking_date',
      time_slot: 'time_slot',
      duration_minutes: 'duration_minutes',
      employee_id: 'employee_id',
      employee_name: 'employee_name',
    };
    for (const [key, col] of Object.entries(map)) {
      if (b[key] !== undefined) {
        fields.push(`${col} = ?`);
        values.push(b[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ message: 'No fields' });
    values.push(req.params.id);
    await query(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`, values);
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    const updated = rows[0];

    const bookingRow = updated as BookingNotificationRow;
    await notifyBookingStatusChange(bookingRow, String(before.status));
    await notifyBookingPaymentChange(bookingRow, String(before.payment_status));

    res.json(mapBooking(updated));
  }),
);

bookingsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.status(204).send();
  }),
);
