import { describe, expect, it, vi } from "vitest";
import { getCandidateReview, listCandidates, type FiscalCandidateQueryRepository } from "@/modules/fiscal/application/fiscal-candidate-queries";
import type { CommandContext } from "@/shared/application/command-context";

function makeContext(role: CommandContext["actorRole"] = "OWNER"): CommandContext {
  return {
    tenantId: "tenant-1",
    actorId: "user-1",
    actorRole: role,
    correlationId: "corr-1"
  };
}

function makeCandidate(overrides: Record<string, unknown> = {}) {
  return {
    id: "candidate-1",
    tenantId: "tenant-1",
    importBatchId: "import-1",
    importRowId: "row-1",
    documentFileId: "doc-1",
    customerName: "Tutor Demo",
    customerDocumentMasked: "*******1234",
    serviceDate: new Date("2026-05-01T00:00:00.000Z"),
    competenceDate: new Date("2026-05-01T00:00:00.000Z"),
    serviceDescription: "Consulta veterinaria demo",
    grossAmountCents: 12990n,
    status: "NEEDS_REVIEW",
    fiscalFingerprintVersion: "v1",
    reviewBlockReasons: ["MISSING_OR_INVALID_AMOUNT"],
    reviewWarnings: ["RAW_CUSTOMER_DOCUMENT_RECEIVED"],
    reviewJustification: null,
    reviewedAt: null,
    createdAt: new Date("2026-05-01T10:00:00.000Z"),
    updatedAt: new Date("2026-05-01T10:10:00.000Z"),
    openInconsistenciesCount: 1,
    ...overrides
  };
}

function makeRepository(overrides: Partial<FiscalCandidateQueryRepository> = {}): FiscalCandidateQueryRepository {
  return {
    listCandidates: vi.fn().mockResolvedValue([makeCandidate()]),
    findCandidateDetail: vi.fn().mockResolvedValue({
      ...makeCandidate(),
      inconsistencies: [
        {
          id: "inc-1",
          tenantId: "tenant-1",
          type: "MISSING_CUSTOMER_DATA",
          severity: "REVIEWABLE",
          status: "OPEN",
          message: "Dado demo pendente de revisao.",
          resolutionNote: null,
          createdAt: new Date("2026-05-01T10:11:00.000Z"),
          resolvedAt: null
        }
      ]
    }),
    ...overrides
  };
}

describe("candidates API query contracts", () => {
  it("lists candidates with candidates.view and serializes money as string", async () => {
    const repository = makeRepository();

    const [item] = await listCandidates({ context: makeContext("ACCOUNTANT"), repository, status: "NEEDS_REVIEW", importBatchId: "import-1" });

    expect(repository.listCandidates).toHaveBeenCalledWith({ tenantId: "tenant-1", status: "NEEDS_REVIEW", importBatchId: "import-1" });
    expect(item.grossAmountCents).toBe("12990");
    expect(item.customerDocumentMasked).toBe("*******1234");
    expect(item.reviewBlockReasons).toEqual(["MISSING_OR_INVALID_AMOUNT"]);
    expect(item.reviewWarnings).toEqual(["RAW_CUSTOMER_DOCUMENT_RECEIVED"]);
    expect(item).not.toHaveProperty("tenantId");
    expect(item).not.toHaveProperty("fiscalFingerprint");
  });

  it("blocks roles without candidates.view", async () => {
    await expect(listCandidates({ context: makeContext("FINANCIAL_OPERATOR"), repository: makeRepository() })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects cross-tenant candidates from repository results", async () => {
    const repository = makeRepository({ listCandidates: vi.fn().mockResolvedValue([makeCandidate({ tenantId: "tenant-2" })]) });

    await expect(listCandidates({ context: makeContext(), repository })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns candidate review with allowlisted inconsistencies", async () => {
    const detail = await getCandidateReview({ context: makeContext(), repository: makeRepository(), candidateId: "candidate-1" });

    expect(detail.inconsistencies[0]).toEqual({
      id: "inc-1",
      type: "MISSING_CUSTOMER_DATA",
      severity: "REVIEWABLE",
      status: "OPEN",
      message: "Dado demo pendente de revisao.",
      resolutionNote: null,
      createdAt: "2026-05-01T10:11:00.000Z",
      resolvedAt: null
    });
    expect(detail.inconsistencies[0]).not.toHaveProperty("tenantId");
    expect(detail).not.toHaveProperty("fiscalFingerprint");
    expect(detail.reviewJustification).toBeNull();
  });
});
