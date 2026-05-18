import { createHash } from "node:crypto";
import type { CommandContext } from "@/shared/application/command-context";
import { InvalidStateError, NotFoundError, ValidationError } from "@/shared/errors/application-error";

export type CommandIdempotencyStatus = "SUCCEEDED" | "FAILED_FINAL" | "FAILED_RETRYABLE";

export type CommandIdempotencyOperation =
  | "fiscal_candidate.mark_ready"
  | "fiscal_batch.create"
  | "fiscal_batch.submit_review"
  | "fiscal_batch.simulate_internal"
  | "fiscal_batch.approve_future_issuance"
  | "fiscal_batch.cancel";

export type CommandIdempotencyRecord = {
  id: string;
  tenantId: string;
  actorId: string | null;
  operation: CommandIdempotencyOperation;
  idempotencyKey: string;
  requestHash: string;
  responseRef: string | null;
  status: CommandIdempotencyStatus;
  createdAt: Date;
};

export type CreateCommandIdempotencyRecordInput = {
  tenantId: string;
  actorId: string | null;
  operation: CommandIdempotencyOperation;
  idempotencyKey: string;
  requestHash: string;
  responseRef: string;
  status: CommandIdempotencyStatus;
};

export type CommandIdempotencyRepository = {
  findCommandIdempotencyRecord(input: {
    tenantId: string;
    operation: CommandIdempotencyOperation;
    idempotencyKey: string;
  }): Promise<CommandIdempotencyRecord | null>;
  createCommandIdempotencyRecord(input: CreateCommandIdempotencyRecordInput): Promise<CommandIdempotencyRecord>;
};

export function normalizeIdempotencyKey(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }

  if (normalized.length > 160) {
    throw new ValidationError("Idempotency key must be 160 characters or fewer.");
  }

  return normalized;
}

function stableStringify(value: unknown): string {
  if (value instanceof Date) {
    return JSON.stringify(value.toISOString());
  }

  if (typeof value === "bigint") {
    return JSON.stringify(value.toString());
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

export function createCommandRequestHash(payload: unknown): string {
  return createHash("sha256").update(stableStringify(payload)).digest("hex");
}

export async function runIdempotentCommand<T>(input: {
  context: CommandContext;
  operation: CommandIdempotencyOperation;
  idempotencyKey?: string | null;
  requestPayload: unknown;
  repository?: CommandIdempotencyRepository;
  loadExisting(responseRef: string): Promise<T | null>;
  getResponseRef(result: T): string;
  execute(): Promise<T>;
}): Promise<T> {
  const idempotencyKey = normalizeIdempotencyKey(input.idempotencyKey);
  if (!idempotencyKey || !input.repository) {
    return input.execute();
  }

  const requestHash = createCommandRequestHash(input.requestPayload);
  const existing = await input.repository.findCommandIdempotencyRecord({
    tenantId: input.context.tenantId,
    operation: input.operation,
    idempotencyKey
  });

  if (existing) {
    if (existing.requestHash !== requestHash) {
      throw new InvalidStateError("Idempotency key replay does not match the original command payload.");
    }

    if (existing.status !== "SUCCEEDED" || !existing.responseRef) {
      throw new InvalidStateError("Idempotent command is not available for replay.");
    }

    const result = await input.loadExisting(existing.responseRef);
    if (!result) {
      throw new NotFoundError("Idempotent command response reference was not found.");
    }

    return result;
  }

  const result = await input.execute();
  await input.repository.createCommandIdempotencyRecord({
    tenantId: input.context.tenantId,
    actorId: input.context.actorId,
    operation: input.operation,
    idempotencyKey,
    requestHash,
    responseRef: input.getResponseRef(result),
    status: "SUCCEEDED"
  });

  return result;
}
