import type { DocumentFileFilters, DocumentFileQueryRepository, DocumentFileRecord } from "@/modules/documents/application/document-file-queries";
import { prisma } from "@/shared/database/prisma";

function paging(filters: DocumentFileFilters) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 50, 100);
  return { skip: (page - 1) * pageSize, take: pageSize };
}

function whereClause(tenantId: string, filters: DocumentFileFilters) {
  return {
    tenantId,
    fileType: filters.fileType,
    mimeType: filters.mimeType,
    createdBy: filters.createdBy,
    createdAt: filters.createdFrom || filters.createdTo ? { gte: filters.createdFrom, lte: filters.createdTo } : undefined
  };
}

function toDocumentFileRecord(document: Awaited<ReturnType<typeof prisma.documentFile.findFirst>> & { _count?: { importBatches: number; fiscalCandidates: number } }): DocumentFileRecord {
  return {
    id: document.id,
    tenantId: document.tenantId,
    fileName: document.fileName,
    fileType: document.fileType,
    mimeType: document.mimeType,
    storagePath: document.storagePath,
    checksumSha256: document.checksumSha256,
    sizeBytes: document.sizeBytes,
    createdBy: document.createdBy,
    createdAt: document.createdAt,
    linkedImportBatchesCount: document._count?.importBatches ?? 0,
    linkedFiscalCandidatesCount: document._count?.fiscalCandidates ?? 0
  };
}

export function createPrismaDocumentFileRepository(): DocumentFileQueryRepository {
  return {
    async listDocumentFiles(input): Promise<DocumentFileRecord[]> {
      const documents = await prisma.documentFile.findMany({
        where: whereClause(input.tenantId, input.filters),
        orderBy: { createdAt: "desc" },
        ...paging(input.filters)
      });
      return documents.map((document) => toDocumentFileRecord(document));
    },

    async findDocumentFile(input): Promise<DocumentFileRecord | null> {
      const document = await prisma.documentFile.findUnique({
        where: { id_tenantId: { id: input.id, tenantId: input.tenantId } },
        include: { _count: { select: { importBatches: true, fiscalCandidates: true } } }
      });
      return document ? toDocumentFileRecord(document) : null;
    }
  };
}
