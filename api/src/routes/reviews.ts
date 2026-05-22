import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { query } from '../db.js';
import { newId, rowDates } from '../utils.js';

function mapReview(row: Record<string, unknown>) {
  const out = rowDates(row);
  if ('rating' in out) (out as Record<string, unknown>).rating = Number(out.rating);
  return out;
}

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

async function loadBooking(bookingId: string) {
  const rows = await query<Record<string, unknown>[]>('SELECT * FROM bookings WHERE id = ?', [bookingId]);
  return rows[0] ? mapBooking(rows[0]) : null;
}

async function existingReviewForBooking(bookingId: string) {
  const rows = await query<Record<string, unknown>[]>(
    'SELECT id FROM reviews WHERE booking_id = ? LIMIT 1',
    [bookingId],
  );
  return rows[0] ?? null;
}

export const reviewsRouter = Router();

reviewsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { customer_email, booking_id } = req.query;
    let sql = 'SELECT * FROM reviews WHERE 1=1';
    const params: unknown[] = [];
    if (customer_email) {
      sql += ' AND LOWER(customer_email) = LOWER(?)';
      params.push(String(customer_email));
    }
    if (booking_id) {
      sql += ' AND booking_id = ?';
      params.push(String(booking_id));
    }
    sql += ' ORDER BY created_at DESC';
    const rows = await query<Record<string, unknown>[]>(sql, params);
    res.json(rows.map(mapReview));
  }),
);

reviewsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM reviews WHERE id = ?', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(mapReview(rows[0]));
  }),
);

reviewsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const customerEmail = String(body.customer_email ?? '').trim();
    const customerName = String(body.customer_name ?? '').trim();
    const bookingId = String(body.booking_id ?? '').trim();
    const rating = Number(body.rating);
    const comment = body.comment != null ? String(body.comment) : undefined;

    if (!customerEmail || !customerName) {
      return res.status(400).json({ message: 'Customer name and email are required' });
    }
    if (!bookingId) {
      return res.status(400).json({ message: 'Booking is required for a review' });
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const booking = await loadBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (String(booking.customer_email).toLowerCase() !== customerEmail.toLowerCase()) {
      return res.status(403).json({ message: 'You can only review your own bookings' });
    }
    if (booking.status !== 'completed' || booking.payment_status !== 'paid') {
      return res.status(400).json({
        message:
          'Reviews are available only after your appointment is completed and payment is marked paid',
      });
    }

    if (await existingReviewForBooking(bookingId)) {
      return res.status(409).json({ message: 'You have already reviewed this appointment' });
    }

    const id = newId();
    const status = 'approved';
    await query(
      `INSERT INTO reviews (
        id, customer_email, customer_name, booking_id, service_id, employee_id, branch_id,
        rating, comment, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        customerEmail,
        customerName,
        bookingId,
        booking.service_id,
        booking.employee_id,
        booking.branch_id,
        rating,
        comment ?? null,
        status,
      ],
    );

    const rows = await query<Record<string, unknown>[]>('SELECT * FROM reviews WHERE id = ?', [id]);
    res.status(201).json(mapReview(rows[0]));
  }),
);

reviewsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const fields: string[] = [];
    const values: unknown[] = [];
    for (const col of ['rating', 'comment', 'status'] as const) {
      if (body[col] !== undefined) {
        fields.push(`${col} = ?`);
        values.push(body[col]);
      }
    }
    if (!fields.length) return res.status(400).json({ message: 'No fields' });
    values.push(req.params.id);
    await query(`UPDATE reviews SET ${fields.join(', ')} WHERE id = ?`, values);
    const rows = await query<Record<string, unknown>[]>('SELECT * FROM reviews WHERE id = ?', [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ message: 'Not found' });
    res.json(mapReview(rows[0]));
  }),
);

reviewsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.status(204).send();
  }),
);
