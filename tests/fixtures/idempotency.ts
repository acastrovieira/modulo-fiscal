import { vi } from "vitest";
import type {
  CommandIdempotencyRecord,
  CommandIdempotencyRepository,
  CreateCommandIdempotencyRecordInput
} from "@/shared/idempotency/command-idempotency";

function recordKey(input: { tenantId: string; operation: string; idempotencyKey: string }) {
  return `${input.tenantId}:${input.operation}:${input.idempotencyKey}`;
}

export function makeIdempotencyRepository() {
  const records = new Map<string, CommandIdempotencyRecord>();
  const repository: CommandIdempotencyRepository = {
    findCommandIdempotencyRecord: vi.fn().mockImplementation(async (input) => records.get(recordKey(input)) ?? null),
    createCommandIdempotencyRecord: vi.fn().mockImplementation(async (input: CreateCommandIdempotencyRecordInput) => {
      const record: CommandIdempotencyRecord = {
        id: `idem-${records.size + 1}`,
        ...input,
        createdAt: new Date("2026-05-18T12:00:00.000Z")
      };
      records.set(recordKey(input), record);
      return record;
    })
  };

  return { repository, records };
}
