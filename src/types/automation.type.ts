export type AutomationEventStatus = "PENDING" | "PROCESSING" | "DELIVERED" | "FAILED";

export interface AutomationEvent {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  status: AutomationEventStatus;
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  nextRetryAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface AutomationStats {
  total: Record<AutomationEventStatus, number>;
  last24h: Record<AutomationEventStatus, number>;
  oldestPendingAt: string | null;
}

export interface AutomationEventListParams {
  page?: number;
  limit?: number;
  status?: AutomationEventStatus;
  eventType?: string;
}