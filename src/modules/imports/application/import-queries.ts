import { assertCommandPermission, type CommandContext } from "@/shared/application/command-context";
import { NotFoundError } from "@/shared/errors/application-error";
import { assertTenantScope } from "@/shared/security/tenant-scope";

export type ImportListStatus =
  | "PENDING_VALIDATION"
  | "VALIDATING"
  | "VALIDATED"
  | "HAS_ERRORS"
  | "READY_FOR_REVIEW"
  | "ARCHIVED";

export type ImportListRecord = {
  id: string;
  tenantId: string;
  documentFileId: string;
  documentFileName: string;
  status: ImportListStatus;
  sourceType: string;
  sourceName: string | null;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  candidatesCount: number;
  openInconsistenciesCount: number;
  createdAt: Date;
  updatedAt: Date;
  validatedAt: Date | null;
};

export type ImportDetailRowRecord = {
  id: string;
  tenantId: string;
  rowNumber: number;
  sourceRowId: string | null;
  status: "RECEIVED" | "NORMALIZED" | "REJECTED" | "CANDIDATE_CREATED";
  normalizedPayload: unknown;
  errorPayload: unknown;
};

export type ImportDetailRecord = ImportListRecord & {
  rows: ImportDetailRowRecord[];
};

export type ImportListItemDTO = {
  id: string;
  documentFileId: string;
  documentFileName: string;
  status: ImportListStatus;
  sourceType: string;
  sourceName: string | null;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  candidatesCount: number;
  openInconsistenciesCount: number;
  createdAt: string;
  updatedAt: string;
  validatedAt: string | null;
};

export type ImportDetailDTO = ImportListItemDTO & {
  rows: Array<{
    id: string;
    rowNumber: number;
    sourceRowId: string | null;
    status: ImportDetailRowRecord["status"];
    normalizedPayload: unknown;
    errorPayload: unknown;
  }>;
};

export type ImportQueryRepository = {
  listImports(input: { tenantId: string; status?: ImportListStatus }): Promise<ImportListRecord[]>;
  findImportDetail(input: { tenantId: string; id: string }): Promise<ImportDetailRecord | null>;
};

function toImportListItemDTO(record: ImportListRecord): ImportListItemDTO {
  return {
    id: record.id,
    documentFileId: record.documentFileId,
    documentFileName: record.documentFileName,
    status: record.status,
    sourceType: record.sourceType,
    sourceName: record.sourceName,
    totalRows: record.totalRows,
    validRows: record.validRows,
    invalidRows: record.invalidRows,
    candidatesCount: record.candidatesCount,
    openInconsistenciesCount: record.openInconsistenciesCount,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    validatedAt: record.validatedAt?.toISOString() ?? null
  };
}

function toImportDetailDTO(record: ImportDetailRecord): ImportDetailDTO {
  return {
    ...toImportListItemDTO(record),
    rows: record.rows.map((row) => {
      assertTenantScope(record.tenantId, row);
      return {
        id: row.id,
        rowNumber: row.rowNumber,
        sourceRowId: row.sourceRowId,
        status: row.status,
        normalizedPayload: row.normalizedPayload,
        errorPayload: row.errorPayload
      };
    })
  };
}

export async function listImports(input: {
  context: CommandContext;
  repository: ImportQueryRepository;
  status?: ImportListStatus;
}): Promise<ImportListItemDTO[]> {
  assertCommandPermission(input.context, "imports.view");

  const imports = await input.repository.listImports({ tenantId: input.context.tenantId, status: input.status });
  return imports.map((record) => {
    assertTenantScope(input.context.tenantId, record);
    return toImportListItemDTO(record);
  });
}

export async function getImportDetail(input: {
  context: CommandContext;
  repository: ImportQueryRepository;
  importBatchId: string;
}): Promise<ImportDetailDTO> {
  assertCommandPermission(input.context, "imports.view");

  const record = await input.repository.findImportDetail({ tenantId: input.context.tenantId, id: input.importBatchId });
  if (!record) {
    throw new NotFoundError("Import batch not found.");
  }

  assertTenantScope(input.context.tenantId, record);
  return toImportDetailDTO(record);
}