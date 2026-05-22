import { apiRequest, USE_MOCK_API } from '../client';
import { buildMockExportRows, flattenForExport, type ReportExportParams } from '../../../lib/report-export-data';
import { getReportModule, REPORT_MODULES, type ReportModule } from '../../../lib/report-modules';
import { delay, store } from '../mock/store';

export type ReportsSummary = {
  totalBookings: number;
  pendingBookings: number;
  paidBookings: number;
  totalRevenue: number;
  activeBranches: number;
  activeServices: number;
  bookingsByStatus: { name: string; count: number }[];
  bookingsByBranch: { branch_id?: string; branch_name: string; count: number; revenue: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  topServices?: { service_id: string; title: string; count: number; revenue: number }[];
  paymentBreakdown?: { name: string; count: number }[];
};

export type ReportExportResult = {
  module: ReportModule;
  columns: { key: string; header: string }[];
  rows: Record<string, unknown>[];
  rowCount: number;
};

export type ModuleReportSummary = {
  module: ReportModule;
  label: string;
  stats: { label: string; value: string | number }[];
  breakdown?: { name: string; count: number; value?: number }[];
};

const empty: ReportsSummary = {
  totalBookings: 0,
  pendingBookings: 0,
  paidBookings: 0,
  totalRevenue: 0,
  activeBranches: 0,
  activeServices: 0,
  bookingsByStatus: [],
  bookingsByBranch: [],
  revenueByMonth: [],
};

function mockSummary(): ReportsSummary {
  const bookings = store.bookings;
  const paid = bookings.filter((b) => b.payment_status === 'paid');
  const totalRevenue = paid.reduce((s, b) => s + b.final_price, 0);
  const monthMap = new Map<string, number>();
  for (const b of paid) {
    const m = b.date.slice(0, 7);
    monthMap.set(m, (monthMap.get(m) ?? 0) + b.final_price);
  }
  const byBranch = store.branches.map((br) => ({
    branch_name: br.name,
    count: bookings.filter((b) => b.branch_id === br.id).length,
    revenue: paid.filter((b) => b.branch_id === br.id).reduce((s, b) => s + b.final_price, 0),
  }));
  const serviceMap = new Map<string, { title: string; count: number; revenue: number }>();
  for (const b of bookings) {
    const cur = serviceMap.get(b.service_id) ?? { title: b.service_title, count: 0, revenue: 0 };
    cur.count += 1;
    if (b.payment_status === 'paid') cur.revenue += b.final_price;
    serviceMap.set(b.service_id, cur);
  }
  return {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    paidBookings: paid.length,
    totalRevenue,
    activeBranches: store.branches.filter((b) => b.status === 'active').length,
    activeServices: store.services.filter((s) => s.status === 'active').length,
    bookingsByStatus: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map((name) => ({
      name,
      count: bookings.filter((b) => b.status === name).length,
    })),
    bookingsByBranch: byBranch,
    revenueByMonth: [...monthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue })),
    topServices: [...serviceMap.entries()]
      .map(([service_id, v]) => ({ service_id, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8),
    paymentBreakdown: ['unpaid', 'paid', 'refunded'].map((name) => ({
      name,
      count: bookings.filter((b) => b.payment_status === name).length,
    })),
  };
}

function mockModuleSummary(module: ReportModule, params: ReportExportParams): ModuleReportSummary {
  const meta = getReportModule(module);
  const rows = buildMockExportRows(
    module,
    {
      bookings: store.bookings,
      users: store.users,
      reviews: store.reviews,
      payouts: [],
      branches: store.branches,
      categories: store.categories,
      services: store.services,
      packages: store.packages,
      employees: store.employees,
      coupons: store.coupons,
      notifications: store.notifications,
    },
    params,
  );

  const stats: { label: string; value: string | number }[] = [
    { label: 'Records in range', value: rows.length },
  ];

  let breakdown: ModuleReportSummary['breakdown'];

  if (module === 'bookings') {
    const paid = rows.filter((b) => b.payment_status === 'paid');
    stats.push({
      label: 'Revenue (paid)',
      value: `$${paid.reduce((s, b) => s + Number(b.final_price), 0).toFixed(2)}`,
    });
    breakdown = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map((name) => ({
      name,
      count: rows.filter((b) => b.status === name).length,
    }));
  } else if (module === 'customers') {
    stats.push({ label: 'Total customers', value: store.users.filter((u) => u.role === 'customer').length });
  } else if (module === 'reviews') {
    const avg =
      rows.length > 0
        ? (
            rows.reduce((s, r) => s + Number(r.rating), 0) / rows.length
          ).toFixed(1)
        : '—';
    stats.push({ label: 'Average rating', value: avg });
    breakdown = ['pending', 'approved', 'rejected'].map((name) => ({
      name,
      count: rows.filter((r) => r.status === name).length,
    }));
  } else if (module === 'coupons') {
    breakdown = rows.map((c) => ({
      name: String(c.code),
      count: Number(c.used_count),
    }));
  }

  return { module, label: meta.label, stats, breakdown };
}

export const reportsApi = {
  modules() {
    return Promise.resolve(REPORT_MODULES);
  },

  async summary(): Promise<ReportsSummary> {
    if (USE_MOCK_API) {
      await delay();
      return mockSummary();
    }
    return apiRequest<ReportsSummary>('/reports/summary');
  },

  async moduleSummary(module: ReportModule, params: ReportExportParams = {}): Promise<ModuleReportSummary> {
    if (USE_MOCK_API) {
      await delay();
      return mockModuleSummary(module, params);
    }
    const q = new URLSearchParams();
    if (params.from) q.set('from', params.from);
    if (params.to) q.set('to', params.to);
    const qs = q.toString();
    return apiRequest<ModuleReportSummary>(`/reports/${module}/summary${qs ? `?${qs}` : ''}`);
  },

  async export(module: ReportModule, params: ReportExportParams = {}): Promise<ReportExportResult> {
    const meta = getReportModule(module);
    if (USE_MOCK_API) {
      await delay();
      const raw = buildMockExportRows(
        module,
        {
          bookings: store.bookings,
          users: store.users,
          reviews: store.reviews,
          payouts: [],
          branches: store.branches,
          categories: store.categories,
          services: store.services,
          packages: store.packages,
          employees: store.employees,
          coupons: store.coupons,
          notifications: store.notifications,
        },
        params,
      );
      const rows = flattenForExport(module, raw as Record<string, unknown>[]);
      return { module, columns: meta.columns, rows, rowCount: rows.length };
    }
    const q = new URLSearchParams();
    if (params.from) q.set('from', params.from);
    if (params.to) q.set('to', params.to);
    const qs = q.toString();
    return apiRequest<ReportExportResult>(`/reports/export/${module}${qs ? `?${qs}` : ''}`);
  },
};
