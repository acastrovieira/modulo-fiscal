import { describe, expect, it, vi } from "vitest";
import { getAuditEvent, listAuditEvents, type AuditEventQueryRepository, type AuditEventRecord } from "@/modules/audit/application/audit-event-queries";
import type { CommandContext } from "@/shared/application/command-context";

function ctx(role: CommandContext["actorRole"] = "AUDITOR"): CommandContext {
  return { tenantId: "tenant-1", actorId: "user-1", actorRole: role, correlationId: "corr-1" };
}

function event(overrides: Partial<AuditEventRecord> = {}): AuditEventRecord {
  return {
    id: "audit-1",
    tenantId: "tenant-1",
    actorId: "user-1",
    eventType: "documents.download_intent_recorded",
    entityType: "DocumentFile",
    entityId: "doc-1",
    beforePayload: { status: "DRAFT", customerDocument: "12345678901" },
    afterPayload: { status: "READY", email: "tutora@example.com" },
    metadata: { storagePath: "tenant-1/private/file.csv", correlation: "safe" },
    correlationId: "corr-1",
    createdAt: new Date("2026-05-01T10:00:00.000Z"),
    ...overrides
  };
}

function repo(overrides: Partial<AuditEventQueryRepository> = {}): AuditEventQueryRepository {
  return {
    listAuditEvents: vi.fn().mockResolvedValue([event()]),
    findAuditEvent: vi.fn().mockResolvedValue(event()),
    ...overrides
  };
}

describe("audit events API query contracts", () => {
  it("lists audit events with audit.view and does not expose raw payloads", async () => {
    const repository = repo();

    const [item] = await listAuditEvents({ context: ctx("ACCOUNTANT"), repository, filters: { correlationId: "corr-1" } });

    expect(repository.listAuditEvents).toHaveBeenCalledWith({ tenantId: "tenant-1", filters: { correlationId: "corr-1" } });
    expect(item).toEqual({
      id: "audit-1",
      actorId: "user-1",
      eventType: "documents.download_intent_recorded",
      entityType: "DocumentFile",
      entityId: "doc-1",
      correlationId: "corr-1",
      metadataPreview: { storagePath: "[redacted]", correlation: "safe" },
      hasBeforePayload: true,
      hasAfterPayload: true,
      createdAt: "2026-05-01T10:00:00.000Z"
    });
    expect(item).not.toHaveProperty("tenantId");
    expect(item).not.toHaveProperty("beforePayload");
    expect(item).not.toHaveProperty("afterPayload");
  });

  it("blocks roles without audit.view", async () => {
    await expect(listAuditEvents({ context: ctx("FISCAL_OPERATOR"), repository: repo() })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects cross-tenant repository rows", async () => {
    await expect(listAuditEvents({ context: ctx(), repository: repo({ listAuditEvents: vi.fn().mockResolvedValue([event({ tenantId: "tenant-2" })]) }) })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns sanitized detail previews", async () => {
    const detail = await getAuditEvent({ context: ctx(), repository: repo(), auditEventId: "audit-1" });

    expect(detail.beforePayloadPreview).toEqual({ status: "DRAFT", customerDocument: "[redacted]" });
    expect(detail.afterPayloadPreview).toEqual({ status: "READY", email: "[redacted]" });
    expect(JSON.stringify(detail)).not.toContain("12345678901");
    expect(JSON.stringify(detail)).not.toContain("tutora@example.com");
    expect(JSON.stringify(detail)).not.toContain("tenant-1/private/file.csv");
  });
});
