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
      entityType: "ImportBatch",
      entityId: "import-1",
      afterPayload: { status: "PENDING_VALIDATION" },
      metadata: { source: "test" },
      correlationId: "corr_test"
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: "11111111-1111-4111-8111-111111111111",
        actorId: "00000000-0000-4000-8000-000000000001",
        eventType: "imports.created",
        entityType: "ImportBatch",
        correlationId: "corr_test"
      })
    });
  });

  it("stores null actor when an event is system-generated", async () => {
    const create = vi.fn().mockResolvedValue({ id: "audit-1" });
    const audit = createAuditRecorder({ auditEvent: { create } } as never);

    await audit.record({
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorId: null,
      eventType: "imports.validation_started",
      entityType: "ImportBatch",
      entityId: "import-1",
      correlationId: "corr_test"
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: null
      })
    });
  });

  it("serializes audit payloads before persistence", async () => {
    const create = vi.fn().mockResolvedValue({ id: "audit-1" });
    const audit = createAuditRecorder({ auditEvent: { create } } as never);

    await audit.record({
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorId: "00000000-0000-4000-8000-000000000001",
      eventType: "inconsistency.resolved",
      entityType: "FiscalInconsistency",
      entityId: "inc-1",
      beforePayload: { status: "OPEN" },
      afterPayload: { status: "RESOLVED" },
      metadata: { note: "validated" },
      correlationId: "corr_test"
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        beforePayload: { status: "OPEN" },
        afterPayload: { status: "RESOLVED" },
        metadata: { note: "validated" }
      })
    });
  });

  it("redacts sensitive payloads before persistence", async () => {
    const create = vi.fn().mockResolvedValue({ id: "audit-1" });
    const audit = createAuditRecorder({ auditEvent: { create } } as never);

    await audit.record({
      tenantId: "11111111-1111-4111-8111-111111111111",
      actorId: "00000000-0000-4000-8000-000000000001",
      eventType: "documents.download_intent_recorded",
      entityType: "DocumentFile",
      entityId: "doc-1",
      beforePayload: { customerDocument: "12345678901", status: "DRAFT" },
      afterPayload: { email: "tutora@example.com", status: "READY" },
      metadata: {
        storagePath: "tenant/private/file.csv",
        providerResponse: { raw: "official payload" },
        idempotencyKey: "client-retry-key",
        checksumSha256: "0123456789abcdef0123456789abcdef"
      },
      correlationId: "corr_test"
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        beforePayload: { customerDocument: "[redacted]", status: "DRAFT" },
        afterPayload: { email: "[redacted]", status: "READY" },
        metadata: {
          storagePath: "[redacted]",
          providerResponse: "[redacted]",
          idempotencyKey: "[redacted]",
          checksumSha256: "[redacted]"
        }
      })
    });
    expect(JSON.stringify(create.mock.calls)).not.toContain("12345678901");
    expect(JSON.stringify(create.mock.calls)).not.toContain("tutora@example.com");
    expect(JSON.stringify(create.mock.calls)).not.toContain("tenant/private/file.csv");
  });

  it("propagates repository failures for critical audit events", async () => {
    const audit = createAuditRecorder({
      auditEvent: {
        create: vi.fn().mockRejectedValue(new Error("db unavailable"))
      }
    } as never);

    await expect(
      audit.record({
        tenantId: "11111111-1111-4111-8111-111111111111",
        actorId: "00000000-0000-4000-8000-000000000001",
        eventType: "batch.approved_for_future_issuance",
        entityType: "FiscalBatch",
        entityId: "batch-1",
        correlationId: "corr_test"
      })
    ).rejects.toThrow("db unavailable");
  });
});
