import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createFiscalOperationsViewModel,
  type FiscalOperationsGovernanceSnapshot
} from "@/modules/operational/application/fiscal-operations-view-model";

function snapshot(overrides: Partial<FiscalOperationsGovernanceSnapshot> = {}): FiscalOperationsGovernanceSnapshot {
  return {
    status: "ok",
    period: { days: 7 },
    checks: {
      nfseIssuance: "disabled",
      externalProviderCalls: "none_detected",
      externalTransmission: "none_detected",
      fiscalValue: "none_detected",
      auditCoverage: "present"
    },
    metrics: {
      totalFiscalSimulationEvents: 12,
      scenarioEvaluations: 4,
      simulatedDocumentsCreated: 3,
      simulatedDocumentsValidated: 2,
      simulatedDocumentsSimulatedIssued: 1,
      simulatedDocumentsVoided: 0,
      unsafeFlaggedEvents: 0
    },
    scenarioEvaluationStatuses: {
      passed: 4,
      needsReview: 0,
      blocked: 0,
      unknown: 0
    },
    ...overrides
  };
}

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("fiscal operations UX view model", () => {
  it("summarizes healthy fiscal governance for the cockpit", () => {
    const model = createFiscalOperationsViewModel(snapshot());

    expect(model).toMatchObject({
      headline: "Simulador fiscal governado",
      tone: "success",
      reviewQueueLabel: "Sem revisoes pendentes"
    });
    expect(model.panels).toHaveLength(4);
    expect(model.panels.find((panel) => panel.label === "Flags proibidas")).toMatchObject({
      value: 0,
      tone: "success"
    });
    expect(JSON.stringify(model)).not.toContain("tenantId");
  });

  it("surfaces review queue and blocked guardrails without official fiscal language", () => {
    const model = createFiscalOperationsViewModel(snapshot({
      status: "blocked",
      metrics: {
        ...snapshot().metrics,
        unsafeFlaggedEvents: 2
      },
      scenarioEvaluationStatuses: {
        passed: 1,
        needsReview: 2,
        blocked: 1,
        unknown: 1
      }
    }));
    const serialized = JSON.stringify(model).toLowerCase();

    expect(model.tone).toBe("critical");
    expect(model.reviewQueueLabel).toBe("4 revisoes de cenario");
    expect(model.panels.find((panel) => panel.label === "Flags proibidas")).toMatchObject({
      value: 2,
      tone: "critical"
    });
    expect(serialized).not.toContain("prefeitura");
    expect(serialized).not.toContain("protocolo");
    expect(serialized).not.toContain("danfse");
  });

  it("wires the fiscal cockpit route and sidebar navigation", () => {
    const route = readProjectFile("src/app/(dashboard)/dashboard/fiscal/page.tsx");
    const sidebar = readProjectFile("src/components/layout/app-sidebar.tsx");
    const cockpit = readProjectFile("src/modules/operational/presentation/fiscal-operations-cockpit.tsx");

    expect(route).toContain("FiscalOperationsCockpit");
    expect(sidebar).toContain("/dashboard/fiscal");
    expect(cockpit).toContain("/api/observability/fiscal-governance?windowDays=7");
    expect(cockpit).toContain("sem emissao real");
    expect(cockpit).not.toContain("Emitir NFS-e");
  });
});
