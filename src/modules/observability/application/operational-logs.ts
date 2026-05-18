import { redactSensitiveValue, type RedactedPayload } from "@/shared/security/redaction";

export const allowedOperationalEvents = [
  "imports.created",
  "imports.validation_started",
  "imports.validation_finished",
  "fiscal_candidate.created",
  "fiscal_candidate.marked_ready",
  "inconsistency.opened",
  "inconsistency.resolved",
  "inconsistency.waived",
  "fiscal_batch.created",
  "fiscal_batch.submitted_for_review",
  "fiscal_batch.simulated_internally",
  "fiscal_batch.approved_for_future_issuance",
  "fiscal_batch.cancelled",
  "documents.download_intent_recorded",
  "fiscal_simulation.profile_configured",
  "fiscal_simulation.service_taker_created",
  "fiscal_simulation.document_created",
  "fiscal_simulation.document_validated",
  "fiscal_simulation.document_simulated_issued",
  "fiscal_simulation.document_voided",
  "fiscal_simulation.scenarios_evaluated",
  "tenant.security_boundary_checked"
] as const;

export type AllowedOperationalEvent = (typeof allowedOperationalEvents)[number];
export type OperationalLogLevel = "info" | "warn" | "error";

export type OperationalLogEntry = {
  level: OperationalLogLevel;
  event: AllowedOperationalEvent;
  service: "vetfiscal-os";
  tenantId?: string;
  actorId?: string;
  correlationId: string;
  metadata?: RedactedPayload;
};

export function createOperationalLogEntry(input: {
  level?: OperationalLogLevel;
  event: AllowedOperationalEvent;
  tenantId?: string;
  actorId?: string;
  correlationId: string;
  metadata?: unknown;
}): OperationalLogEntry {
  return {
    level: input.level ?? "info",
    event: input.event,
    service: "vetfiscal-os",
    tenantId: input.tenantId,
    actorId: input.actorId,
    correlationId: input.correlationId,
    metadata: input.metadata === undefined ? undefined : redactSensitiveValue(input.metadata)
  };
}
