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

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "STATUS_CHANGE"
  | "ROLE_CHANGE"
  | "PAYMENT"
  | "SUBMISSION"
  | "EVALUATION"
  | "SECURITY";

// Matches AUDIT_LOG_SELECT exactly.
export interface AuditLog {
  id: string;
  userId: string | null;
  action: AuditAction;
  entity: string;
  entityId: string | null;
  oldValue: unknown;
  newValue: unknown;
  metadata: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; role: string } | null;
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: AuditAction;
  entity?: string;
}