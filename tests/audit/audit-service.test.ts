import { describe, expect, it, vi } from "vitest";
import { createAuditRecorder } from "@/modules/audit/application/audit-service";

describe("audit.record", () => {
  it("persists a normalized audit event through the injected repository", async () => {
    const create = vi.fn().mockResolvedValue({ id: "audit-1" });
    const audit = createAuditRecorder({
      auditEvent: {
        create
      }
    } as never);

    await audit.record({
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorId: "00000000-0000-4000-8000-000000000001",
      eventType: "imports.created",
      entityType: "ImportJob",
      entityId: "import-1",
      afterPayload: { status: "PENDING" },
      metadata: { source: "test" },
      correlationId: "corr_test"
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: "11111111-1111-4111-8111-111111111111",
        actorId: "00000000-0000-4000-8000-000000000001",
        eventType: "imports.created",
        entityType: "ImportJob",
        correlationId: "corr_test"
      })
    });
  });
});
