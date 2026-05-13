export type AuditEventInput = {
  tenantId: string;
  actorId?: string | null;
  eventType: string;
  entityType: string;
  entityId?: string | null;
  beforePayload?: unknown;
  afterPayload?: unknown;
  metadata?: Record<string, unknown>;
  correlationId: string;
};
