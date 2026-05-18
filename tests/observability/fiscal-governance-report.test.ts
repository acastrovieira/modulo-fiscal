import { describe, expect, it, vi } from "vitest";
import {
  createFiscalGovernanceReport,
  getFiscalGovernanceReport,
  type FiscalGovernanceAuditRecord,
  type FiscalGovernanceRepository
} from "@/modules/observability/application/fiscal-governance-report";
import { toFiscalGovernanceReportDTO } from "@/modules/observability/presentation/fiscal-governance-schemas";
import { ForbiddenError } from "@/shared/errors/application-error";
import { makeCommandContext, tenantAId } from "../fixtures/security";

const now = new Date("2026-05-18T12:00:00.000Z");

function record(overrides: Partial<FiscalGovernanceAuditRecord> = {}): FiscalGovernanceAuditRecord {
  return {
    eventType: "fiscal_simulation.scenarios_evaluated",
    afterPayload: { status: "PASSED" },
    metadata: {
      simulatedOnly: true,
      fiscalValue: false,
      externalProviderCalled: false,
      externalTransmission: false,
      nfseIssued: false
    },
    createdAt: new Date("2026-05-18T10:00:00.000Z"),
    ...overrides
  };
}

function repository(records: FiscalGovernanceAuditRecord[]): FiscalGovernanceRepository {
  return {
    findFiscalSimulationAuditRecords: vi.fn().mockResolvedValue(records)
  };
}

describe("fiscal governance report", () => {
  it("summarizes fiscal simulation audit events without exposing sensitive payloads", () => {
    const report = createFiscalGovernanceReport({
      now,
      records: [
        record(),
        record({ eventType: "fiscal_simulation.document_created", afterPayload: { totalAmountCents: "15000" } }),
        record({ eventType: "fiscal_simulation.document_validated" }),
        record({ eventType: "fiscal_simulation.document_simulated_issued" }),
        record({ eventType: "fiscal_simulation.document_voided" }),
        record({ afterPayload: { status: "NEEDS_REVIEW" } }),
        record({ afterPayload: { status: "BLOCKED" } })
      ]
    });

    expect(report).toMatchObject({
      service: "vetfiscal-os",
      scope: "tenant",
      status: "ok",
      checks: {
        nfseIssuance: "disabled",
        externalProviderCalls: "none_detected",
        externalTransmission: "none_detected",
        fiscalValue: "none_detected",
        auditCoverage: "present"
      },
      metrics: {
        totalFiscalSimulationEvents: 7,
        scenarioEvaluations: 3,
        simulatedDocumentsCreated: 1,
        simulatedDocumentsValidated: 1,
        simulatedDocumentsSimulatedIssued: 1,
        simulatedDocumentsVoided: 1,
        unsafeFlaggedEvents: 0
      },
      scenarioEvaluationStatuses: {
        passed: 1,
        needsReview: 1,
        blocked: 1,
        unknown: 0
      }
    });
    expect(JSON.stringify(report)).not.toContain("tenantId");
    expect(JSON.stringify(report)).not.toContain("documentHash");
  });

  it("blocks governance status when unsafe fiscal flags are detected", () => {
    const report = createFiscalGovernanceReport({
      now,
      records: [
        record({
          metadata: {
            simulatedOnly: false,
            fiscalValue: true,
            externalProviderCalled: true,
            externalTransmission: true,
            nfseIssued: true
          }
        })
      ]
    });

    expect(report.status).toBe("blocked");
    expect(report.checks.externalProviderCalls).toBe("detected");
    expect(report.checks.externalTransmission).toBe("detected");
    expect(report.checks.fiscalValue).toBe("detected");
    expect(report.metrics.unsafeFlaggedEvents).toBe(1);
  });

  it("marks attention when no fiscal simulation audit events exist", () => {
    const report = createFiscalGovernanceReport({ now, records: [] });

    expect(report.status).toBe("attention");
    expect(report.checks.auditCoverage).toBe("missing");
  });

  it("requires audit.view permission and scopes repository queries by tenant", async () => {
    const repo = repository([record()]);

    await expect(getFiscalGovernanceReport({
      context: makeCommandContext("AUDITOR"),
      repository: repo,
      now,
      windowDays: 3
    })).resolves.toMatchObject({ status: "ok" });

    expect(repo.findFiscalSimulationAuditRecords).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: tenantAId,
      limit: 500
    }));

    await expect(getFiscalGovernanceReport({
      context: makeCommandContext("FISCAL_OPERATOR"),
      repository: repo,
      now
    })).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("returns a public DTO without raw audit payloads or tenant identifiers", () => {
    const dto = toFiscalGovernanceReportDTO(createFiscalGovernanceReport({
      now,
      records: [record({ afterPayload: { status: "PASSED", documentHash: "hash-secret" } })]
    }));
    const serialized = JSON.stringify(dto);

    expect(dto).toMatchObject({
      disclaimer: "OBSERVABILIDADE INTERNA - SEM VALOR FISCAL - NAO TRANSMITIDO A AMBIENTE OFICIAL"
    });
    expect(serialized).not.toContain("hash-secret");
    expect(serialized).not.toContain("tenantId");
    expect(serialized.toLowerCase()).not.toContain("prefeitura");
    expect(serialized.toLowerCase()).not.toContain("protocolo");
  });
});
