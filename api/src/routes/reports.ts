import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { query } from '../db.js';

export const reportsRouter = Router();

reportsRouter.get(
  '/summary',
  asyncHandler(async (_req, res) => {
  const bookings = await query<Record<string, unknown>[]>('SELECT * FROM bookings');
  const branches = await query<{ id: string; name: string }[]>('SELECT id, name FROM branches');
  const services = await query<{ id: string; title: string }[]>('SELECT id, title FROM services');

  const paid = bookings.filter((b) => b.payment_status === 'paid');
  const totalRevenue = paid.reduce((s, b) => s + Number(b.final_price), 0);
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  const bookingsByStatus = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map((name) => ({
    name,
    count: bookings.filter((b) => b.status === name).length,
  }));

  const bookingsByBranch = branches.map((br) => ({
    branch_id: br.id,
    branch_name: br.name,
    count: bookings.filter((b) => b.branch_id === br.id).length,
    revenue: paid
      .filter((b) => b.branch_id === br.id)
      .reduce((s, b) => s + Number(b.final_price), 0),
  }));

  const monthMap = new Map<string, number>();
  for (const b of paid) {
    const d = String(b.booking_date).slice(0, 7);
    monthMap.set(d, (monthMap.get(d) ?? 0) + Number(b.final_price));
  }
  const revenueByMonth = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  const serviceMap = new Map<string, { title: string; count: number; revenue: number }>();
  for (const b of bookings) {
    const sid = String(b.service_id);
    const cur = serviceMap.get(sid) ?? {
      title: String(b.service_title),
      count: 0,
      revenue: 0,
    };
    cur.count += 1;
    if (b.payment_status === 'paid') cur.revenue += Number(b.final_price);
    serviceMap.set(sid, cur);
  }
  const topServices = [...serviceMap.entries()]
    .map(([service_id, v]) => ({ service_id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const paymentBreakdown = ['unpaid', 'paid', 'refunded'].map((name) => ({
    name,
    count: bookings.filter((b) => b.payment_status === name).length,
  }));

  res.json({
    totalBookings: bookings.length,
    totalRevenue,
    pendingBookings,
    paidBookings: paid.length,
    activeBranches: branches.length,
    activeServices: services.length,
    bookingsByStatus,
    bookingsByBranch,
    revenueByMonth,
    topServices,
    paymentBreakdown,
  });
  }),
);
