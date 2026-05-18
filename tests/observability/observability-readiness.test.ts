import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHealthReport } from "@/modules/observability/application/health-report";
import { allowedOperationalEvents, createOperationalLogEntry } from "@/modules/observability/application/operational-logs";
import { getSentryReadiness } from "@/modules/observability/application/sentry-readiness";
import { GET as getHealth } from "@/app/api/health/route";

const root = process.cwd();

function readProjectFile(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

describe("observability readiness", () => {
  it("creates a public health report without exposing connection strings or secrets", () => {
    const report = createHealthReport({
      now: new Date("2026-05-14T12:00:00.000Z"),
      databaseUrl: "postgresql://user:secret@localhost:5432/vetfiscal",
      sentryDsn: "https://secret@sentry.example/1",
      environment: "Local",
      version: "0.1.0"
    });

    expect(report).toEqual({
      service: "vetfiscal-os",
      status: "ok",
      environment: "Local",
      version: "0.1.0",
      timestamp: "2026-05-14T12:00:00.000Z",
      checks: {
        api: "ok",
        databaseConfiguration: "configured",
        sentryConfiguration: "configured",
        queues: "not_enabled_in_mvp",
        nfseIssuance: "disabled_in_mvp"
      }
    });
    expect(JSON.stringify(report)).not.toContain("postgresql://");
    expect(JSON.stringify(report)).not.toContain("secret");
    expect(JSON.stringify(report)).not.toContain("sentry.example");
  });

  it("serves the health route without leaking internals", async () => {
    const response = getHealth();
    const payload = await response.json();

    expect(payload.service).toBe("vetfiscal-os");
    expect(payload.checks.nfseIssuance).toBe("disabled_in_mvp");
    expect(JSON.stringify(payload)).not.toMatch(/postgresql:\/\/|SENTRY_DSN|storagePath|stack|secret/i);
  });

  it("marks readiness degraded when database configuration is missing", () => {
    const report = createHealthReport({ now: new Date("2026-05-14T12:00:00.000Z"), databaseUrl: "", environment: "Local" });

    expect(report.status).toBe("degraded");
    expect(report.checks.databaseConfiguration).toBe("missing");
  });

  it("keeps operational event allowlist aligned with known audit events", () => {
    expect(allowedOperationalEvents).toEqual(expect.arrayContaining([
      "imports.created",
      "imports.validation_started",
      "imports.validation_finished",
      "fiscal_candidate.created",
      "fiscal_candidate.marked_ready",
      "inconsistency.opened",
      "inconsistency.resolved",
      "inconsistency.waived",
      "fiscal_batch.created",
      "fiscal_batch.submitted_for_review",
      "fiscal_batch.simulated_internally",
      "fiscal_batch.approved_for_future_issuance",
      "fiscal_batch.cancelled",
      "documents.download_intent_recorded",
      "fiscal_simulation.scenarios_evaluated"
    ]));
  });

  it("redacts sensitive metadata in operational log entries", () => {
    const entry = createOperationalLogEntry({
      event: "imports.validation_finished",
      level: "warn",
      tenantId: "tenant-1",
      actorId: "user-1",
      correlationId: "corr-1",
      metadata: {
        fileName: "agenda.csv",
        customerDocument: "12345678901",
        storagePath: "tenant/private/agenda.csv",
        email: "tutora@example.com"
      }
    });

    expect(entry.metadata).toEqual({
      fileName: "agenda.csv",
      customerDocument: "[redacted]",
      storagePath: "[redacted]",
      email: "[redacted]"
    });
    expect(JSON.stringify(entry)).not.toContain("12345678901");
    expect(JSON.stringify(entry)).not.toContain("tenant/private/agenda.csv");
    expect(JSON.stringify(entry)).not.toContain("tutora@example.com");
  });

  it("keeps Sentry as future readiness without activating runtime integration", () => {
    expect(getSentryReadiness({ sentryDsn: "https://secret@sentry.example/1" })).toEqual({
      enabled: false,
      configured: true,
      reason: "future_integration",
      requiredEnv: "SENTRY_DSN"
    });
  });

  it("keeps Sprint 16 operational documents in place", () => {
    const files = [
      "docs/operations/observability-policy.md",
      "docs/operations/runbooks/import-failure.md",
      "docs/operations/runbooks/stuck-batch.md",
      "docs/operations/runbooks/tenant-isolation-incident.md",
      "docs/operations/runbooks/beta-release.md",
      "docs/product/beta-readiness-checklist.md",
      "docs/product/beta-residual-risk-matrix.md"
    ];

    for (const file of files) {
      expect(readProjectFile(file).length, file).toBeGreaterThan(300);
    }
  });

  it("documents SENTRY_DSN as an empty future variable only", () => {
    const envExample = readProjectFile(".env.example");

    expect(envExample).toContain('SENTRY_DSN=""');
    expect(envExample).not.toContain("sentry.example");
  });
});
