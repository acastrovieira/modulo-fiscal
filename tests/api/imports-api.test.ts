import { describe, expect, it, vi } from "vitest";
import { listImports, getImportDetail, type ImportQueryRepository } from "@/modules/imports/application/import-queries";
import type { CommandContext } from "@/shared/application/command-context";

function makeContext(role: CommandContext["actorRole"] = "OWNER"): CommandContext {
  return {
    tenantId: "tenant-1",
    actorId: "user-1",
    actorRole: role,
    correlationId: "corr-1"
  };
}

function makeRepository(overrides: Partial<ImportQueryRepository> = {}): ImportQueryRepository {
  return {
    listImports: vi.fn().mockResolvedValue([
      {
        id: "import-1",
        tenantId: "tenant-1",
        documentFileId: "doc-1",
        documentFileName: "agenda-demo.csv",
        status: "READY_FOR_REVIEW",
        sourceType: "structured_file",
        sourceName: "Agenda Demo",
        totalRows: 10,
        validRows: 8,
        invalidRows: 2,
        candidatesCount: 3,
        openInconsistenciesCount: 1,
        createdAt: new Date("2026-05-01T10:00:00.000Z"),
        updatedAt: new Date("2026-05-01T10:10:00.000Z"),
        validatedAt: new Date("2026-05-01T10:09:00.000Z")
      }
    ]),
    findImportDetail: vi.fn().mockResolvedValue({
      id: "import-1",
      tenantId: "tenant-1",
      documentFileId: "doc-1",
      documentFileName: "agenda-demo.csv",
      status: "READY_FOR_REVIEW",
      sourceType: "structured_file",
      sourceName: "Agenda Demo",
      totalRows: 1,
      validRows: 1,
      invalidRows: 0,
      candidatesCount: 1,
      openInconsistenciesCount: 0,
      createdAt: new Date("2026-05-01T10:00:00.000Z"),
      updatedAt: new Date("2026-05-01T10:10:00.000Z"),
      validatedAt: null,
      rows: [
        {
          id: "row-1",
          tenantId: "tenant-1",
          rowNumber: 1,
          sourceRowId: "A1",
          status: "NORMALIZED",
          normalizedPayload: { customerName: "Tutora Demo" },
          errorPayload: null
        }
      ]
    }),
    ...overrides
  };
}

describe("imports API query contracts", () => {
  it("lists imports with imports.view and returns an allowlisted DTO", async () => {
    const repository = makeRepository();

    const [item] = await listImports({ context: makeContext("ACCOUNTANT"), repository, status: "READY_FOR_REVIEW" });

    expect(repository.listImports).toHaveBeenCalledWith({ tenantId: "tenant-1", status: "READY_FOR_REVIEW" });
    expect(item).toEqual({
      id: "import-1",
      documentFileId: "doc-1",
      documentFileName: "agenda-demo.csv",
      status: "READY_FOR_REVIEW",
      sourceType: "structured_file",
      sourceName: "Agenda Demo",
      totalRows: 10,
      validRows: 8,
      invalidRows: 2,
      candidatesCount: 3,
      openInconsistenciesCount: 1,
      createdAt: "2026-05-01T10:00:00.000Z",
      updatedAt: "2026-05-01T10:10:00.000Z",
      validatedAt: "2026-05-01T10:09:00.000Z"
    });
    expect(item).not.toHaveProperty("tenantId");
    expect(item).not.toHaveProperty("idempotencyKey");
  });

  it("blocks roles without imports.view", async () => {
    await expect(listImports({ context: makeContext("AUDITOR"), repository: makeRepository() })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects cross-tenant records from repository results", async () => {
    const repository = makeRepository({
      listImports: vi.fn().mockResolvedValue([
        {
          id: "import-other",
          tenantId: "tenant-2",
          documentFileId: "doc-2",
          documentFileName: "other.csv",
          status: "READY_FOR_REVIEW",
          sourceType: "structured_file",
          sourceName: null,
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          candidatesCount: 0,
          openInconsistenciesCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          validatedAt: null
        }
      ])
    });

    await expect(listImports({ context: makeContext(), repository })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns import detail without raw row payload", async () => {
    const detail = await getImportDetail({ context: makeContext(), repository: makeRepository(), importBatchId: "import-1" });

    expect(detail.rows[0]).toEqual({
      id: "row-1",
      rowNumber: 1,
      sourceRowId: "A1",
      status: "NORMALIZED",
      normalizedPayload: { customerName: "Tutora Demo" },
      errorPayload: null
    });
    expect(detail.rows[0]).not.toHaveProperty("tenantId");
    expect(detail.rows[0]).not.toHaveProperty("rawPayload");
  });
});