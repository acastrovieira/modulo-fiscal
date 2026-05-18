import type { AuditRecorder } from "@/modules/audit/application/audit-service";
import {
  assertSupportedImportParserVersion,
  normalizeImportRow,
  type ImportParserVersion
} from "@/modules/imports/domain/import-parser";
import {
  createCommandAuditEvent,
  assertPermissionForCommand,
  type CommandContext
} from "@/shared/application/command-context";
import { InvalidStateError, NotFoundError, ValidationError } from "@/shared/errors/application-error";
import { assertTenantScope } from "@/shared/security/tenant-scope";

export type ImportBatchStatus =
  | "PENDING_VALIDATION"
  | "VALIDATING"
  | "VALIDATED"
  | "HAS_ERRORS"
  | "READY_FOR_REVIEW"
  | "ARCHIVED";

export type ImportRowStatus = "RECEIVED" | "NORMALIZED" | "REJECTED" | "CANDIDATE_CREATED";

export type DocumentFileRecord = {
  id: string;
  tenantId: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  storagePath: string;
  checksumSha256: string;
  sizeBytes: bigint;
  createdBy: string | null;
  createdAt: Date;
};

export type ImportBatchRecord = {
  id: string;
  tenantId: string;
  documentFileId: string;
  createdBy: string | null;
  status: ImportBatchStatus;
  sourceType: string;
  sourceName: string | null;
  idempotencyKey: string | null;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  createdAt: Date;
  updatedAt: Date;
  validatedAt: Date | null;
  archivedAt: Date | null;
};

export type ImportRowCreateInput = {
  tenantId: string;
  importBatchId: string;
  rowNumber: number;
  sourceRowId?: string | null;
  status: ImportRowStatus;
  rawPayload: unknown;
  normalizedPayload?: unknown;
  errorPayload?: unknown;
};

export type ImportRepository = {
  findDocumentFileById(id: string): Promise<DocumentFileRecord | null>;
  findImportBatchById(id: string): Promise<ImportBatchRecord | null>;
  findImportBatchByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<ImportBatchRecord | null>;
  createImportBatch(input: {
    tenantId: string;
    documentFileId: string;
    createdBy: string;
    status: ImportBatchStatus;
    sourceType: string;
    sourceName?: string | null;
    idempotencyKey?: string | null;
  }): Promise<ImportBatchRecord>;
  updateImportBatch(input: {
    id: string;
    tenantId: string;
    status: ImportBatchStatus;
    totalRows?: number;
    validRows?: number;
    invalidRows?: number;
    validatedAt?: Date;
  }): Promise<ImportBatchRecord>;
  createImportRows(rows: ImportRowCreateInput[]): Promise<void>;
};

export type CreateImportFromDocumentInput = {
  context: CommandContext;
  documentFileId: string;
  sourceName?: string;
  idempotencyKey?: string;
};

export type ValidateImportInput = {
  context: CommandContext;
  importBatchId: string;
  rows: readonly unknown[];
  parserVersion?: ImportParserVersion | string;
  now?: Date;
};

function ensureDocumentIsProcessable(documentFile: DocumentFileRecord): void {
  if (!documentFile.checksumSha256) {
    throw new ValidationError("Document file must have a checksum before import.");
  }
}

export function createImportService(dependencies: { repository: ImportRepository; audit: AuditRecorder }) {
  const { repository, audit } = dependencies;

  return {
    async createImportFromDocument(input: CreateImportFromDocumentInput): Promise<ImportBatchRecord> {
      assertPermissionForCommand(input.context, "createImportFromDocument");

      if (input.idempotencyKey) {
        const existing = await repository.findImportBatchByIdempotencyKey(input.context.tenantId, input.idempotencyKey);
        if (existing) {
          assertTenantScope(input.context.tenantId, existing);
          return existing;
        }
      }

      const documentFile = await repository.findDocumentFileById(input.documentFileId);
      if (!documentFile) {
        throw new NotFoundError("Document file not found.");
      }

      assertTenantScope(input.context.tenantId, documentFile);
      ensureDocumentIsProcessable(documentFile);

      const importBatch = await repository.createImportBatch({
        tenantId: input.context.tenantId,
        documentFileId: documentFile.id,
        createdBy: input.context.actorId,
        status: "PENDING_VALIDATION",
        sourceType: "structured_file",
        sourceName: input.sourceName ?? documentFile.fileName,
        idempotencyKey: input.idempotencyKey ?? null
      });

      await audit.record(
        createCommandAuditEvent(input.context, {
          eventType: "imports.created",
          entityType: "ImportBatch",
          entityId: importBatch.id,
          afterPayload: {
            status: importBatch.status,
            documentFileId: importBatch.documentFileId,
            sourceType: importBatch.sourceType,
            sourceName: importBatch.sourceName,
            idempotencyKey: importBatch.idempotencyKey
          }
        })
      );

      return importBatch;
    },

    async validateImport(input: ValidateImportInput): Promise<ImportBatchRecord> {
      assertPermissionForCommand(input.context, "validateImport");
      const parserVersion = assertSupportedImportParserVersion(input.parserVersion);

      const importBatch = await repository.findImportBatchById(input.importBatchId);
      if (!importBatch) {
        throw new NotFoundError("Import batch not found.");
      }

      assertTenantScope(input.context.tenantId, importBatch);

      if (importBatch.status !== "PENDING_VALIDATION") {
        throw new InvalidStateError(`Import batch cannot be validated from ${importBatch.status}.`);
      }

      const validating = await repository.updateImportBatch({
        id: importBatch.id,
        tenantId: input.context.tenantId,
        status: "VALIDATING"
      });

      await audit.record(
        createCommandAuditEvent(input.context, {
          eventType: "imports.validation_started",
          entityType: "ImportBatch",
          entityId: validating.id,
          beforePayload: { status: importBatch.status },
          afterPayload: { status: validating.status, parserVersion }
        })
      );

      const rows: ImportRowCreateInput[] = [];
      const seenFingerprints = new Set<string>();
      let validRows = 0;
      let invalidRows = 0;
      let duplicateRows = 0;

      input.rows.forEach((row, index) => {
        const rowNumber = index + 1;
        try {
          const normalizedPayload = normalizeImportRow({ row, rowNumber, parserVersion, seenFingerprints });
          if (normalizedPayload.duplicateWithinImport) {
            duplicateRows += 1;
          }

          rows.push({
            tenantId: input.context.tenantId,
            importBatchId: importBatch.id,
            rowNumber,
            sourceRowId: normalizedPayload.sourceRowId,
            status: "NORMALIZED",
            rawPayload: row,
            normalizedPayload
          });
          validRows += 1;
        } catch (error) {
          rows.push({
            tenantId: input.context.tenantId,
            importBatchId: importBatch.id,
            rowNumber,
            status: "REJECTED",
            rawPayload: row,
            errorPayload: {
              parserVersion,
              message: error instanceof Error ? error.message : "Invalid row"
            }
          });
          invalidRows += 1;
        }
      });

      if (rows.length > 0) {
        await repository.createImportRows(rows);
      }

      const finalStatus: ImportBatchStatus = invalidRows > 0 ? "HAS_ERRORS" : validRows > 0 ? "READY_FOR_REVIEW" : "VALIDATED";
      const finalized = await repository.updateImportBatch({
        id: importBatch.id,
        tenantId: input.context.tenantId,
        status: finalStatus,
        totalRows: input.rows.length,
        validRows,
        invalidRows,
        validatedAt: input.now ?? new Date()
      });

      await audit.record(
        createCommandAuditEvent(input.context, {
          eventType: "imports.validation_finished",
          entityType: "ImportBatch",
          entityId: finalized.id,
          beforePayload: { status: validating.status },
          afterPayload: {
            status: finalized.status,
            totalRows: finalized.totalRows,
            validRows: finalized.validRows,
            invalidRows: finalized.invalidRows,
            duplicateRows,
            parserVersion
          }
        })
      );

      return finalized;
    }
  };
}
