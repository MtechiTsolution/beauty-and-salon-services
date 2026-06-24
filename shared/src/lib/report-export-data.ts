import type { ReportModule } from './report-modules';
import { getReportModule } from './report-modules';
import type {
  Booking,
  Branch,
  Coupon,
  Employee,
  Notification,
  Package,
  Review,
  Service,
  ServiceCategory,
  StaffPayout,
  User,
} from '../types';

export type ReportExportParams = { from?: string; to?: string; branch_id?: string };

function inDateRange(value: string | undefined, from?: string, to?: string): boolean {
  if (!from && !to) return true;
  const d = (value ?? '').slice(0, 10);
  if (!d) return true;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

function inPeriodRange(start: string, end: string, from?: string, to?: string): boolean {
  if (!from && !to) return true;
  const ps = start.slice(0, 10);
  const pe = end.slice(0, 10);
  if (from && pe < from) return false;
  if (to && ps > to) return false;
  return true;
}

function pickRow(row: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of keys) out[k] = row[k] ?? '';
  return out;
}

function joinIds(ids?: string[]): string {
  return (ids ?? []).join('; ');
}

export function flattenForExport(
  module: ReportModule,
  rows: Record<string, unknown>[],
): Record<string, unknown>[] {
  const keys = getReportModule(module).columns.map((c) => c.key);
  return rows.map((r) => pickRow(r, keys));
}

export function buildMockExportRows(
  module: ReportModule,
  data: {
    bookings: Booking[];
    users: User[];
    reviews: Review[];
    payouts: StaffPayout[];
    branches: Branch[];
    categories: ServiceCategory[];
    services: Service[];
    packages: Package[];
    employees: Employee[];
    coupons: Coupon[];
    notifications: Notification[];
  },
  params: ReportExportParams,
): Record<string, unknown>[] {
  const { from, to } = params;
  const asRows = (rows: object[]) => rows as Record<string, unknown>[];

  switch (module) {
    case 'bookings':
      return asRows(
        data.bookings
          .filter((b) => inDateRange(b.date, from, to))
          .map((b) => ({
            ...b,
            date: b.date?.slice(0, 10) ?? b.date,
          })),
      );
    case 'customers': {
      const customers = data.users.filter((u) => u.role === 'customer');
      return asRows(
        customers
        .filter((c) => inDateRange(c.created_at, from, to))
        .map((c) => {
          const mine = data.bookings.filter((b) => b.customer_email === c.email);
          const paidTotal = mine
            .filter((b) => b.payment_status === 'paid')
            .reduce((s, b) => s + b.final_price, 0);
          return {
            id: c.id,
            full_name: c.full_name,
            email: c.email,
            phone: c.phone ?? '',
            booking_count: mine.length,
            paid_total: paidTotal.toFixed(2),
            created_at: c.created_at,
          };
        }),
      );
    }
    case 'reviews':
      return asRows(data.reviews.filter((r) => inDateRange(r.created_at, from, to)));
    case 'payouts':
      return asRows(
        data.payouts.filter((p) => inPeriodRange(p.period_start, p.period_end, from, to)),
      );
    case 'branches':
      return asRows(data.branches);
    case 'categories':
      return asRows(data.categories);
    case 'services':
      return asRows(data.services.map((s) => ({
        ...s,
        branch_ids: joinIds(s.branch_ids),
        employee_ids: joinIds(s.employee_ids),
      })));
    case 'packages':
      return asRows(data.packages.map((p) => ({
        ...p,
        service_ids: joinIds(p.service_ids),
        branch_ids: joinIds(p.branch_ids),
      })));
    case 'staff':
      return asRows(data.employees.map((e) => ({
        ...e,
        service_ids: joinIds(e.service_ids),
      })));
    case 'coupons':
      return asRows(data.coupons);
    case 'notifications':
      return asRows(
        data.notifications
          .filter((n) => inDateRange(n.created_at, from, to))
          .map((n) => ({ ...n, read: n.read ? 'yes' : 'no' })),
      );
    default:
      return [];
  }
}
