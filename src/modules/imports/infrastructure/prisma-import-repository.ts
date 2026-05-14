import type { Prisma } from "@prisma/client";
import type { DocumentFileRecord, ImportBatchRecord, ImportRepository, ImportRowCreateInput } from "@/modules/imports/application/import-service";
import type { ImportDetailRecord, ImportListRecord, ImportListStatus, ImportQueryRepository } from "@/modules/imports/application/import-queries";
import { prisma } from "@/shared/database/prisma";

type PrismaImportBatch = Awaited<ReturnType<typeof prisma.importBatch.findFirst>>;

type ImportBatchWithDocument = NonNullable<PrismaImportBatch> & {
  documentFile: { fileName: string };
  _count: { candidates: number; inconsistencies: number };
};

type ImportBatchDetail = ImportBatchWithDocument & {
  rows: Array<{
    id: string;
    tenantId: string;
    rowNumber: number;
    sourceRowId: string | null;
    status: "RECEIVED" | "NORMALIZED" | "REJECTED" | "CANDIDATE_CREATED";
    normalizedPayload: Prisma.JsonValue | null;
    errorPayload: Prisma.JsonValue | null;
  }>;
};

function toImportBatchRecord(batch: NonNullable<PrismaImportBatch>): ImportBatchRecord {
  return {
    id: batch.id,
    tenantId: batch.tenantId,
    documentFileId: batch.documentFileId,
    createdBy: batch.createdBy,
    status: batch.status,
    sourceType: batch.sourceType,
    sourceName: batch.sourceName,
    idempotencyKey: batch.idempotencyKey,
    totalRows: batch.totalRows,
    validRows: batch.validRows,
    invalidRows: batch.invalidRows,
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
    validatedAt: batch.validatedAt,
    archivedAt: batch.archivedAt
  };
}

function toImportListRecord(batch: ImportBatchWithDocument): ImportListRecord {
  return {
    id: batch.id,
    tenantId: batch.tenantId,
    documentFileId: batch.documentFileId,
    documentFileName: batch.documentFile.fileName,
    status: batch.status,
    sourceType: batch.sourceType,
    sourceName: batch.sourceName,
    totalRows: batch.totalRows,
    validRows: batch.validRows,
    invalidRows: batch.invalidRows,
    candidatesCount: batch._count.candidates,
    openInconsistenciesCount: batch._count.inconsistencies,
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
    validatedAt: batch.validatedAt
  };
}

function toImportDetailRecord(batch: ImportBatchDetail): ImportDetailRecord {
  return {
    ...toImportListRecord(batch),
    rows: batch.rows.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      rowNumber: row.rowNumber,
      sourceRowId: row.sourceRowId,
      status: row.status,
      normalizedPayload: row.normalizedPayload,
      errorPayload: row.errorPayload
    }))
  };
}

function jsonInput(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export function createPrismaImportRepository(): ImportRepository & ImportQueryRepository {
  return {
    async findDocumentFileById(id: string): Promise<DocumentFileRecord | null> {
      const document = await prisma.documentFile.findUnique({ where: { id } });
      return document;
    },

    async findImportBatchById(id: string): Promise<ImportBatchRecord | null> {
      const batch = await prisma.importBatch.findUnique({ where: { id } });
      return batch ? toImportBatchRecord(batch) : null;
    },

    async findImportBatchByIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<ImportBatchRecord | null> {
      const batch = await prisma.importBatch.findUnique({ where: { tenantId_idempotencyKey: { tenantId, idempotencyKey } } });
      return batch ? toImportBatchRecord(batch) : null;
    },

    async createImportBatch(input): Promise<ImportBatchRecord> {
      const batch = await prisma.importBatch.create({ data: input });
      return toImportBatchRecord(batch);
    },

    async updateImportBatch(input): Promise<ImportBatchRecord> {
      const batch = await prisma.importBatch.update({
        where: { id_tenantId: { id: input.id, tenantId: input.tenantId } },
        data: {
          status: input.status,
          totalRows: input.totalRows,
          validRows: input.validRows,
          invalidRows: input.invalidRows,
          validatedAt: input.validatedAt
        }
      });
      return toImportBatchRecord(batch);
    },

    async createImportRows(rows: ImportRowCreateInput[]): Promise<void> {
      if (rows.length === 0) {
        return;
      }

      await prisma.importRow.createMany({
        data: rows.map((row) => ({
          tenantId: row.tenantId,
          importBatchId: row.importBatchId,
          rowNumber: row.rowNumber,
          sourceRowId: row.sourceRowId ?? null,
          status: row.status,
          rawPayload: jsonInput(row.rawPayload),
          normalizedPayload: row.normalizedPayload === undefined ? undefined : jsonInput(row.normalizedPayload),
          errorPayload: row.errorPayload === undefined ? undefined : jsonInput(row.errorPayload)
        }))
      });
    },

    async listImports(input: { tenantId: string; status?: ImportListStatus }): Promise<ImportListRecord[]> {
      const batches = await prisma.importBatch.findMany({
        where: { tenantId: input.tenantId, status: input.status },
        include: {
          documentFile: { select: { fileName: true } },
          _count: { select: { candidates: true, inconsistencies: { where: { status: { in: ["OPEN", "IN_REVIEW"] } } } } }
        },
        orderBy: { createdAt: "desc" },
        take: 50
      });
      return batches.map((batch) => toImportListRecord(batch));
    },

    async findImportDetail(input: { tenantId: string; id: string }): Promise<ImportDetailRecord | null> {
      const batch = await prisma.importBatch.findUnique({
        where: { id_tenantId: { id: input.id, tenantId: input.tenantId } },
        include: {
          documentFile: { select: { fileName: true } },
          rows: {
            select: {
              id: true,
              tenantId: true,
              rowNumber: true,
              sourceRowId: true,
              status: true,
              normalizedPayload: true,
              errorPayload: true
            },
            orderBy: { rowNumber: "asc" },
            take: 100
          },
          _count: { select: { candidates: true, inconsistencies: { where: { status: { in: ["OPEN", "IN_REVIEW"] } } } } }
        }
      });
      return batch ? toImportDetailRecord(batch) : null;
    }
  };
}