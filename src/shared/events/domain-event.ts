export type DomainEvent<TPayload extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  type: string;
  occurredAt: Date;
  tenantId: string;
  correlationId: string;
  payload: TPayload;
};
