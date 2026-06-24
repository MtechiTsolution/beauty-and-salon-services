import type { ReportModule } from './report-modules';
import { getReportModule } from './report-modules';

export type ModuleReportSummary = {
  module: ReportModule;
  label: string;
  stats: { label: string; value: string | number }[];
  breakdown?: { name: string; count: number; value?: number }[];
};

function capitalize(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildModuleSummary(module: ReportModule, rows: Record<string, unknown>[]): ModuleReportSummary {
  const meta = getReportModule(module);
  const count = rows.length;

  if (module === 'bookings') {
    const paid = rows.filter((r) => r.payment_status === 'paid');
    const revenue = paid.reduce((s, r) => s + Number(r.final_price ?? 0), 0);
    const statusNames = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
    const breakdown = statusNames.map((name) => ({
      name,
      count: rows.filter((r) => r.status === name).length,
    }));

    return {
      module,
      label: meta.label,
      stats: [
        { label: 'Records in range', value: count },
        {
          label: 'Revenue (paid)',
          value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(revenue),
        },
      ],
      breakdown,
    };
  }

  if (module === 'customers') {
    const withBookings = rows.filter((r) => Number(r.booking_count ?? 0) > 0).length;
    const paidTotal = rows.reduce((s, r) => s + Number(r.paid_total ?? 0), 0);
    return {
      module,
      label: meta.label,
      stats: [
        { label: 'Customers', value: count },
        { label: 'With bookings', value: withBookings },
        {
          label: 'Paid total',
          value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(paidTotal),
        },
      ],
    };
  }

  if (module === 'coupons') {
    const active = rows.filter((r) => r.status === 'active').length;
    const used = rows.reduce((s, r) => s + Number(r.used_count ?? 0), 0);
    return {
      module,
      label: meta.label,
      stats: [
        { label: 'Coupons', value: count },
        { label: 'Active', value: active },
        { label: 'Total redemptions', value: used },
      ],
    };
  }

  if (module === 'staff') {
    const active = rows.filter((r) => r.status === 'active').length;
    return {
      module,
      label: meta.label,
      stats: [
        { label: 'Staff members', value: count },
        { label: 'Active', value: active },
      ],
    };
  }

  if (module === 'services' || module === 'packages') {
    const active = rows.filter((r) => r.status === 'active').length;
    return {
      module,
      label: meta.label,
      stats: [
        { label: meta.label, value: count },
        { label: 'Active', value: active },
      ],
    };
  }

  if (module === 'categories' || module === 'branches') {
    const active = rows.filter((r) => r.status === 'active').length;
    return {
      module,
      label: meta.label,
      stats: [
        { label: 'Records', value: count },
        { label: 'Active', value: active },
      ],
    };
  }

  return {
    module,
    label: meta.label,
    stats: [{ label: 'Records', value: count }],
  };
}
