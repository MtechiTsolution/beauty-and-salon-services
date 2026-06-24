import { apiRequest } from '../client';
import { branchQuery, type SalonScopeParams } from '../../../lib/salon-scope';
import type { ReportExportParams } from '../../../lib/report-export-data';
import type { ModuleReportSummary } from '../../../lib/report-summaries';
import { REPORT_MODULES, type ReportModule } from '../../../lib/report-modules';

export type { ModuleReportSummary };

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

export const reportsApi = {
  modules() {
    return Promise.resolve(REPORT_MODULES);
  },

  async summary(params?: SalonScopeParams): Promise<ReportsSummary> {
    return apiRequest<ReportsSummary>(`/reports/summary${branchQuery(params?.branch_id)}`);
  },

  async moduleSummary(
    module: ReportModule,
    params: ReportExportParams & SalonScopeParams = {},
  ): Promise<ModuleReportSummary> {
    const q = new URLSearchParams();
    if (params.from) q.set('from', params.from);
    if (params.to) q.set('to', params.to);
    if (params.branch_id) q.set('branch_id', params.branch_id);
    const qs = q.toString();
    return apiRequest<ModuleReportSummary>(`/reports/${module}/summary${qs ? `?${qs}` : ''}`);
  },

  async export(module: ReportModule, params: ReportExportParams & SalonScopeParams = {}): Promise<ReportExportResult> {
    const q = new URLSearchParams();
    if (params.from) q.set('from', params.from);
    if (params.to) q.set('to', params.to);
    if (params.branch_id) q.set('branch_id', params.branch_id);
    const qs = q.toString();
    return apiRequest<ReportExportResult>(`/reports/export/${module}${qs ? `?${qs}` : ''}`);
  },
};
