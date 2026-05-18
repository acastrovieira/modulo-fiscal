import { describe, expect, it } from "vitest";
import type { FiscalServiceTaker, FiscalSimulationProfile, SimulatedFiscalDocument } from "@/modules/fiscal/domain/fiscal-simulation";
import { evaluateFiscalSimulationScenarios } from "@/modules/fiscal/domain/fiscal-simulation-scenarios";
import { tenantAId, userAId } from "../fixtures/security";

function makeProfile(overrides: Partial<FiscalSimulationProfile> = {}): FiscalSimulationProfile {
  return {
    id: "profile-1",
    tenantId: tenantAId,
    status: "CONFIGURED",
    municipalityCode: "3550308",
    taxRegime: "simples_nacional",
    serviceDefaultCode: "05.01",
    simulationMode: true,
    ...overrides
  };
}

function makeTaker(overrides: Partial<FiscalServiceTaker> = {}): FiscalServiceTaker {
  return {
    id: "taker-1",
    tenantId: tenantAId,
    name: "Maria Tutora",
    documentMasked: "***.456.789-**",
    documentHash: "hash-not-public",
    documentType: "CPF",
    emailMasked: "ma***@vetfiscal.local",
    status: "ACTIVE",
    ...overrides
  };
}

function makeDocument(overrides: Partial<SimulatedFiscalDocument> = {}): SimulatedFiscalDocument {
  return {
    id: "simdoc-1",
    tenantId: tenantAId,
    serviceTakerId: "taker-1",
    status: "VALIDATED",
    simulationId: "sim_abc123",
    description: "Consulta veterinaria",
    totalAmountCents: 15000n,
    fiscalValue: false,
    externalTransmission: false,
    createdBy: userAId,
    validatedBy: userAId,
    validatedAt: new Date("2026-05-17T12:00:00.000Z"),
    simulatedBy: null,
    simulatedAt: null,
    voidedBy: null,
    voidedAt: null,
    items: [
      {
        id: "item-1",
        tenantId: tenantAId,
        simulatedDocumentId: "simdoc-1",
        description: "Consulta",
        serviceCode: "05.01",
        amountCents: 15000n
      }
    ],
    ...overrides
  };
}

describe("fiscal simulation scenarios", () => {
  it("passes baseline scenario without exposing fiscal value or transmission", () => {
    const evaluation = evaluateFiscalSimulationScenarios({
      profile: makeProfile(),
      taker: makeTaker(),
      document: makeDocument()
    });

    expect(evaluation).toMatchObject({
      scenarioSetId: "vetcare-simulation-baseline",
      scenarioSetVersion: "2026.05",
      simulatedOnly: true,
      fiscalValue: false,
      externalTransmission: false,
      status: "PASSED"
    });
    expect(evaluation.findings).toHaveLength(1);
    expect(evaluation.findings[0]?.code).toBe("BASELINE_SCENARIOS_PASSED");
  });

  it("requires review for unknown taker document, service code mismatch and high amount", () => {
    const evaluation = evaluateFiscalSimulationScenarios({
      profile: makeProfile(),
      taker: makeTaker({ documentType: "UNKNOWN", documentMasked: "***" }),
      document: makeDocument({
        totalAmountCents: 150000n,
        items: [
          {
            id: "item-1",
            tenantId: tenantAId,
            simulatedDocumentId: "simdoc-1",
            description: "Procedimento",
            serviceCode: "07.01",
            amountCents: 150000n
          }
        ]
      })
    });

    expect(evaluation.status).toBe("NEEDS_REVIEW");
    expect(evaluation.findings.map((finding) => finding.code)).toEqual([
      "UNKNOWN_TAKER_DOCUMENT",
      "SERVICE_CODE_OUTSIDE_PROFILE_DEFAULT",
      "HIGH_VALUE_SIMULATION_REVIEW"
    ]);
    expect(JSON.stringify(evaluation)).not.toContain("hash-not-public");
  });

  it("blocks non-simulation flags and empty items", () => {
    const evaluation = evaluateFiscalSimulationScenarios({
      profile: makeProfile(),
      taker: makeTaker(),
      document: makeDocument({
        simulationId: "real_unsafe",
        fiscalValue: true,
        externalTransmission: true,
        items: []
      })
    });

    expect(evaluation.status).toBe("BLOCKED");
    expect(evaluation.findings.map((finding) => finding.code)).toEqual([
      "SIMULATION_ONLY_VIOLATION",
      "NO_ITEMS"
    ]);
  });
});
