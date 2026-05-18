import { describe, expect, it, vi } from "vitest";
import { InvalidStateError, ValidationError } from "@/shared/errors/application-error";
import {
  createCommandRequestHash,
  normalizeIdempotencyKey,
  runIdempotentCommand
} from "@/shared/idempotency/command-idempotency";
import { makeIdempotencyRepository } from "../fixtures/idempotency";
import { makeCommandContext, tenantAId, tenantBId } from "../fixtures/security";

describe("command idempotency", () => {
  it("creates deterministic request hashes for canonical payloads", () => {
    const first = createCommandRequestHash({ batchId: "batch-1", reason: "Review", amount: 1500n });
    const second = createCommandRequestHash({ amount: 1500n, reason: "Review", batchId: "batch-1" });

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it("normalizes empty keys and rejects oversized keys", () => {
    expect(normalizeIdempotencyKey("  key-1  ")).toBe("key-1");
    expect(normalizeIdempotencyKey("   ")).toBeUndefined();
    expect(() => normalizeIdempotencyKey("x".repeat(161))).toThrow(ValidationError);
  });

  it("returns stored response on replay without executing twice", async () => {
    const idempotency = makeIdempotencyRepository();
    const execute = vi.fn().mockResolvedValue({ id: "resource-1" });
    const loadExisting = vi.fn().mockResolvedValue({ id: "resource-1" });

    await runIdempotentCommand<{ id: string }>({
      context: makeCommandContext("OWNER"),
      operation: "fiscal_batch.submit_review",
      idempotencyKey: "idem-1",
      requestPayload: { batchId: "batch-1" },
      repository: idempotency.repository,
      loadExisting,
      getResponseRef: (result) => result.id,
      execute
    });
    const replay = await runIdempotentCommand<{ id: string }>({
      context: makeCommandContext("OWNER"),
      operation: "fiscal_batch.submit_review",
      idempotencyKey: "idem-1",
      requestPayload: { batchId: "batch-1" },
      repository: idempotency.repository,
      loadExisting,
      getResponseRef: (result) => result.id,
      execute
    });

    expect(replay).toEqual({ id: "resource-1" });
    expect(execute).toHaveBeenCalledTimes(1);
    expect(loadExisting).toHaveBeenCalledTimes(1);
  });

  it("blocks divergent replay for the same tenant operation and key", async () => {
    const idempotency = makeIdempotencyRepository();

    await runIdempotentCommand({
      context: makeCommandContext("OWNER"),
      operation: "fiscal_batch.cancel",
      idempotencyKey: "idem-divergent",
      requestPayload: { batchId: "batch-1", reason: "A" },
      repository: idempotency.repository,
      loadExisting: async () => ({ id: "batch-1" }),
      getResponseRef: (result) => result.id,
      execute: async () => ({ id: "batch-1" })
    });

    await expect(
      runIdempotentCommand({
        context: makeCommandContext("OWNER"),
        operation: "fiscal_batch.cancel",
        idempotencyKey: "idem-divergent",
        requestPayload: { batchId: "batch-1", reason: "B" },
        repository: idempotency.repository,
        loadExisting: async () => ({ id: "batch-1" }),
        getResponseRef: (result) => result.id,
        execute: async () => ({ id: "batch-1" })
      })
    ).rejects.toThrow(InvalidStateError);
  });

  it("isolates identical idempotency keys across tenants", async () => {
    const idempotency = makeIdempotencyRepository();

    await runIdempotentCommand({
      context: makeCommandContext("OWNER", tenantAId),
      operation: "fiscal_batch.submit_review",
      idempotencyKey: "same-key",
      requestPayload: { batchId: "batch-a" },
      repository: idempotency.repository,
      loadExisting: async () => ({ id: "batch-a" }),
      getResponseRef: (result) => result.id,
      execute: async () => ({ id: "batch-a" })
    });
    await runIdempotentCommand({
      context: makeCommandContext("OWNER", tenantBId),
      operation: "fiscal_batch.submit_review",
      idempotencyKey: "same-key",
      requestPayload: { batchId: "batch-b" },
      repository: idempotency.repository,
      loadExisting: async () => ({ id: "batch-b" }),
      getResponseRef: (result) => result.id,
      execute: async () => ({ id: "batch-b" })
    });

    expect(idempotency.records.size).toBe(2);
  });
});
