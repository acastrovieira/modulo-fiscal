import type { Prisma } from "@prisma/client";
import type { AuditEventInput } from "@/modules/audit/domain/audit-event";
import { redactAuditPayload } from "@/shared/security/redaction";

export type AuditRecorder = {
  record(input: AuditEventInput): Promise<void>;
};

type AuditEventRepository = {
  auditEvent: {
    create(args: { data: Prisma.AuditEventUncheckedCreateInput }): Promise<unknown>;
  };
};

async function getDefaultRepository(): Promise<AuditEventRepository> {
  const { prisma } = await import("@/shared/database/prisma");
  return prisma as unknown as AuditEventRepository;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function toSafeAuditJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  return toJsonValue(redactAuditPayload(value));
}

export function createAuditRecorder(db?: AuditEventRepository): AuditRecorder {
  return {
    async record(input) {
      const repository = db ?? (await getDefaultRepository());

      await repository.auditEvent.create({
        data: {
          tenantId: input.tenantId,
          actorId: input.actorId ?? null,
          eventType: input.eventType,
          entityType: input.entityType,
          entityId: input.entityId ?? null,
          beforePayload: toSafeAuditJsonValue(input.beforePayload),
          afterPayload: toSafeAuditJsonValue(input.afterPayload),
          metadata: toSafeAuditJsonValue(input.metadata),
          correlationId: input.correlationId
        }
      });
    }
  };
}

export const audit = createAuditRecorder();
