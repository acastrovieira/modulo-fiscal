import { describe, expect, it, vi } from "vitest";
import {
  getOperationalDashboardSummary,
  type OperationalDashboardRepository
} from "@/modules/operational/application/dashboard-metrics";
import { ForbiddenError } from "@/shared/errors/application-error";
import { makeCommandContext, tenantAId } from "../fixtures/security";

function makeRepository(overrides: Partial<OperationalDashboardRepository> = {}): OperationalDashboardRepository {
  return {
    getCounts: vi.fn().mockResolvedValue({
      importsPending: 2,
      candidatesPendingReview: 5,
      inconsistenciesOpen: 3,
      blockingInconsistenciesOpen: 1,
      batchesInReview: 1,
      simulatedBatches: 2,
      approvedForFutureIssuanceThisWeek: 4,
      importErrors: 1
    }),
    ...overrides
  };
}

describe("getOperationalDashboardSummary", () => {
  it("returns a tenant-scoped cockpit DTO", async () => {
    const repository = makeRepository();
    const now = new Date("2026-05-13T20:00:00.000Z");

    const result = await getOperationalDashboardSummary({
      context: makeCommandContext("FISCAL_MANAGER"),
      repository,
      now
    });

    expect(repository.getCounts).toHaveBeenCalledWith(tenantAId, now);
    expect(result.tenantId).toBe(tenantAId);
    expect(result.generatedAt).toBe(now.toISOString());
    expect(result.metrics).toHaveLength(6);
    expect(result.queue).toHaveLength(4);
    expect(result.alerts.length).toBeGreaterThan(0);
  });

  it("keeps real NFS-e issuance disabled in the cockpit DTO", async () => {
    const result = await getOperationalDashboardSummary({
      context: makeCommandContext("OWNER"),
      repository: makeRepository()
    });

    const weeklyIssuance = result.metrics.find((metric) => metric.label === "Emissoes da semana");

    expect(weeklyIssuance).toMatchObject({
      value: 0,
      severity: "neutral",
      helperText: "NFS-e real desativada nesta fase"
    });
    expect(result.guardrails).toContain("Nenhum provider NFS-e e chamado pelo cockpit.");
  });

  it("blocks roles without imports.view", async () => {
    await expect(
      getOperationalDashboardSummary({
        context: makeCommandContext("AUDITOR"),
        repository: makeRepository()
      })
    ).rejects.toThrow(ForbiddenError);
  });
});
