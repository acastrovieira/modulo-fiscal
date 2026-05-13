import { describe, expect, it } from "vitest";
import {
  assertPermissionForCommand,
  createCommandAuditEvent,
  createCommandContext
} from "@/shared/application/command-context";
import { ForbiddenError } from "@/shared/errors/application-error";
import { makeCommandContext } from "../fixtures/security";

describe("command context", () => {
  it("creates a backend command context with tenant, actor, role and generated correlation id", async () => {
    const context = await createCommandContext();

    expect(context).toMatchObject({
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorId: "00000000-0000-4000-8000-000000000001",
      actorRole: "OWNER"
    });
    expect(context.correlationId).toMatch(/^corr_/);
  });

  it("preserves an incoming correlation id", async () => {
    const context = await createCommandContext({ correlationId: "corr_existing" });

    expect(context.correlationId).toBe("corr_existing");
  });

  it("enforces command permission through backend context", () => {
    expect(() => assertPermissionForCommand(makeCommandContext("FISCAL_MANAGER"), "simulateBatchInternally")).not.toThrow();
    expect(() => assertPermissionForCommand(makeCommandContext("ACCOUNTANT"), "simulateBatchInternally")).toThrow(ForbiddenError);
  });

  it("creates audit events from command context without trusting client tenant or actor", () => {
    const event = createCommandAuditEvent(makeCommandContext("OWNER"), {
      eventType: "batch.approved_for_future_issuance",
      entityType: "FiscalBatch",
      entityId: "batch-1",
      afterPayload: { status: "APPROVED_FOR_FUTURE_ISSUANCE" }
    });

    expect(event).toEqual({
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorId: "00000000-0000-4000-8000-000000000001",
      correlationId: "corr_test",
      eventType: "batch.approved_for_future_issuance",
      entityType: "FiscalBatch",
      entityId: "batch-1",
      afterPayload: { status: "APPROVED_FOR_FUTURE_ISSUANCE" }
    });
  });
});