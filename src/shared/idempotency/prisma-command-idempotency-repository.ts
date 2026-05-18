import { prisma } from "@/shared/database/prisma";
import type {
  CommandIdempotencyRecord,
  CommandIdempotencyRepository,
  CommandIdempotencyStatus,
  CreateCommandIdempotencyRecordInput
} from "@/shared/idempotency/command-idempotency";

type PrismaCommandIdempotencyRecord = {
  id: string;
  tenantId: string;
  actorId: string | null;
  operation: string;
  idempotencyKey: string;
  requestHash: string;
  responseRef: string | null;
  status: string;
  createdAt: Date;
};

function toCommandIdempotencyRecord(record: PrismaCommandIdempotencyRecord): CommandIdempotencyRecord {
  return {
    id: record.id,
    tenantId: record.tenantId,
    actorId: record.actorId,
    operation: record.operation as CommandIdempotencyRecord["operation"],
    idempotencyKey: record.idempotencyKey,
    requestHash: record.requestHash,
    responseRef: record.responseRef,
    status: record.status as CommandIdempotencyStatus,
    createdAt: record.createdAt
  };
}

export function createPrismaCommandIdempotencyRepository(): CommandIdempotencyRepository {
  return {
    async findCommandIdempotencyRecord(input) {
      const record = await prisma.commandIdempotencyRecord.findUnique({
        where: {
          tenantId_operation_idempotencyKey: {
            tenantId: input.tenantId,
            operation: input.operation,
            idempotencyKey: input.idempotencyKey
          }
        }
      });

      return record ? toCommandIdempotencyRecord(record) : null;
    },

    async createCommandIdempotencyRecord(input: CreateCommandIdempotencyRecordInput) {
      const record = await prisma.commandIdempotencyRecord.create({ data: input });
      return toCommandIdempotencyRecord(record);
    }
  };
}
