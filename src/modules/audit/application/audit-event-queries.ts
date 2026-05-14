import { assertCommandPermission, type CommandContext } from "@/shared/application/command-context";
import { NotFoundError } from "@/shared/errors/application-error";
import { redactAuditPayload, type RedactedPayload } from "@/shared/security/redaction";
import { assertTenantScope } from "@/shared/security/tenant-scope";

export type AuditEventFilters = {
  eventType?: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  correlationId?: string;
  createdFrom?: Date;
  createdTo?: Date;
  page?: number;
  pageSize?: number;
};

export type AuditEventRecord = {
  id: string;
  tenantId: string;
  actorId: string | null;
  eventType: string;
  entityType: string;
  entityId: string | null;
  beforePayload: unknown;
  afterPayload: unknown;
  metadata: unknown;
  correlationId: string;
  createdAt: Date;
};

export type AuditEventListItemDTO = {
  id: string;
  actorId: string | null;
  eventType: string;
  entityType: string;
  entityId: string | null;
  correlationId: string;
  metadataPreview: RedactedPayload | null;
  hasBeforePayload: boolean;
  hasAfterPayload: boolean;
  createdAt: string;
};

export type AuditEventDetailDTO = AuditEventListItemDTO & {
  beforePayloadPreview: RedactedPayload | null;
  afterPayloadPreview: RedactedPayload | null;
};

export type AuditEventQueryRepository = {
  listAuditEvents(input: { tenantId: string; filters: AuditEventFilters }): Promise<AuditEventRecord[]>;
  findAuditEvent(input: { tenantId: string; id: string }): Promise<AuditEventRecord | null>;
};

export function toAuditEventListItemDTO(record: AuditEventRecord): AuditEventListItemDTO {
  return {
    id: record.id,
    actorId: record.actorId,
    eventType: record.eventType,
    entityType: record.entityType,
    entityId: record.entityId,
    correlationId: record.correlationId,
    metadataPreview: redactAuditPayload(record.metadata),
    hasBeforePayload: record.beforePayload !== null && record.beforePayload !== undefined,
    hasAfterPayload: record.afterPayload !== null && record.afterPayload !== undefined,
    createdAt: record.createdAt.toISOString()
  };
}

function toAuditEventDetailDTO(record: AuditEventRecord): AuditEventDetailDTO {
  return {
    ...toAuditEventListItemDTO(record),
    beforePayloadPreview: redactAuditPayload(record.beforePayload),
    afterPayloadPreview: redactAuditPayload(record.afterPayload)
  };
}

export async function listAuditEvents(input: {
  context: CommandContext;
  repository: AuditEventQueryRepository;
  filters?: AuditEventFilters;
}): Promise<AuditEventListItemDTO[]> {
  assertCommandPermission(input.context, "audit.view");

  const records = await input.repository.listAuditEvents({ tenantId: input.context.tenantId, filters: input.filters ?? {} });
  return records.map((record) => {
    assertTenantScope(input.context.tenantId, record);
    return toAuditEventListItemDTO(record);
  });
}

export async function getAuditEvent(input: {
  context: CommandContext;
  repository: AuditEventQueryRepository;
  auditEventId: string;
}): Promise<AuditEventDetailDTO> {
  assertCommandPermission(input.context, "audit.view");

  const record = await input.repository.findAuditEvent({ tenantId: input.context.tenantId, id: input.auditEventId });
  if (!record) throw new NotFoundError("Audit event not found.");

  assertTenantScope(input.context.tenantId, record);
  return toAuditEventDetailDTO(record);
}
