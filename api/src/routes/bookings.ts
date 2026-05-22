import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { query } from '../db.js';
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
    const { customer_email, date, employee_id, status } = req.query;
    let sql = 'SELECT * FROM bookings WHERE 1=1';
    const params: unknown[] = [];
    if (customer_email) {
      sql += ' AND customer_email = ?';
      params.push(customer_email);
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

    const { assertNoStaffSlotConflict, assertSlotNotInPast } = await import('../lib/bookingConflict.js');
    assertSlotNotInPast(String(b.date), String(b.time_slot));
    await assertNoStaffSlotConflict({
      employeeId: String(b.employee_id),
      date: String(b.date),
      timeSlot: String(b.time_slot),
      durationMinutes: Number(b.duration_minutes) || 30,
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
    res.status(201).json(mapBooking(rows[0]));
  }),
);

bookingsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const b = req.body;
    const fields: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, string> = {
      status: 'status',
      payment_status: 'payment_status',
      payment_method: 'payment_method',
      notes: 'notes',
      date: 'booking_date',
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
    res.json(mapBooking(rows[0]));
  }),
);

bookingsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.status(204).send();
  }),
);
