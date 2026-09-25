// Matches DashboardStatsResponse in the backend's admin.interface.ts exactly.
export interface DashboardStatsResponse {
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  companies: {
    total: number;
    verified: number;
  };
  problems: {
    total: number;
  };
  assessments: {
    total: number;
    byStatus: Record<string, number>;
  };
  attempts: {
    total: number;
    byStatus: Record<string, number>;
  };
  payments: {
    totalPaid: number;
    totalRevenueMinor: number;
  };
}