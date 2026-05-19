import type { FiscalCandidateRecord, FiscalCandidateRepository, FiscalImportBatchRecord, FiscalImportRowRecord, CreateFiscalCandidateInput } from "@/modules/fiscal/application/fiscal-candidate-service";
import type { FiscalCandidateDetailRecord, FiscalCandidateListRecord, FiscalCandidateQueryRepository } from "@/modules/fiscal/application/fiscal-candidate-queries";
import type { FiscalCandidateReviewBlockReason, FiscalCandidateReviewWarning, FiscalCandidateStatus } from "@/modules/fiscal/domain/fiscal-candidate";
import { prisma } from "@/shared/database/prisma";

type PrismaCandidate = NonNullable<Awaited<ReturnType<typeof prisma.fiscalCandidate.findFirst>>>;

type CandidateWithCounts = PrismaCandidate & {
  _count: { inconsistencies: number };
};

type CandidateDetail = CandidateWithCounts & {
  inconsistencies: Array<{
    id: string;
    tenantId: string;
    type: string;
    severity: string;
    status: string;
    message: string;
    resolutionNote: string | null;
    createdAt: Date;
    resolvedAt: Date | null;
  }>;
};

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function toReviewBlockReasons(value: unknown): FiscalCandidateReviewBlockReason[] {
  return toStringArray(value).filter((item): item is FiscalCandidateReviewBlockReason =>
    ["DUPLICATE_WITHIN_IMPORT", "MISSING_OR_INVALID_AMOUNT", "MISSING_SERVICE_DATE"].includes(item)
  );
}

function toReviewWarnings(value: unknown): FiscalCandidateReviewWarning[] {
  return toStringArray(value).filter((item): item is FiscalCandidateReviewWarning =>
    ["RAW_CUSTOMER_DOCUMENT_RECEIVED"].includes(item)
  );
}

function toFiscalCandidateRecord(candidate: PrismaCandidate): FiscalCandidateRecord {
  return {
    id: candidate.id,
    tenantId: candidate.tenantId,
    importBatchId: candidate.importBatchId,
    importRowId: candidate.importRowId,
    documentFileId: candidate.documentFileId,
    customerName: candidate.customerName,
    customerDocumentMasked: candidate.customerDocumentMasked,
    serviceDate: candidate.serviceDate,
    competenceDate: candidate.competenceDate,
    serviceDescription: candidate.serviceDescription,
    grossAmountCents: candidate.grossAmountCents,
    status: candidate.status,
    fiscalFingerprintVersion: candidate.fiscalFingerprintVersion,
    fiscalFingerprint: candidate.fiscalFingerprint,
    reviewBlockReasons: toReviewBlockReasons(candidate.reviewBlockReasons),
    reviewWarnings: toReviewWarnings(candidate.reviewWarnings),
    reviewJustification: candidate.reviewJustification,
    reviewedBy: candidate.reviewedBy,
    reviewedAt: candidate.reviewedAt
  };
}

function toCandidateListRecord(candidate: CandidateWithCounts): FiscalCandidateListRecord {
  return {
    id: candidate.id,
    tenantId: candidate.tenantId,
    importBatchId: candidate.importBatchId,
    importRowId: candidate.importRowId,
    documentFileId: candidate.documentFileId,
    customerName: candidate.customerName,
    customerDocumentMasked: candidate.customerDocumentMasked,
    serviceDate: candidate.serviceDate,
    competenceDate: candidate.competenceDate,
    serviceDescription: candidate.serviceDescription,
    grossAmountCents: candidate.grossAmountCents,
    status: candidate.status,
    fiscalFingerprintVersion: candidate.fiscalFingerprintVersion,
    reviewBlockReasons: toReviewBlockReasons(candidate.reviewBlockReasons),
    reviewWarnings: toReviewWarnings(candidate.reviewWarnings),
    reviewJustification: candidate.reviewJustification,
    reviewedAt: candidate.reviewedAt,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
    openInconsistenciesCount: candidate._count.inconsistencies
  };
}

function toCandidateDetailRecord(candidate: CandidateDetail): FiscalCandidateDetailRecord {
  return {
    ...toCandidateListRecord(candidate),
    inconsistencies: candidate.inconsistencies
  };
}

export function createPrismaFiscalCandidateRepository(): FiscalCandidateRepository & FiscalCandidateQueryRepository {
  return {
    async findImportBatchById(id: string): Promise<FiscalImportBatchRecord | null> {
      const batch = await prisma.importBatch.findUnique({ where: { id } });
      return batch
        ? {
            id: batch.id,
            tenantId: batch.tenantId,
            documentFileId: batch.documentFileId,
            status: batch.status
          }
        : null;
    },

    async findNormalizedRowsByImportBatchId(importBatchId: string): Promise<FiscalImportRowRecord[]> {
      const rows = await prisma.importRow.findMany({
        where: { importBatchId, status: "NORMALIZED" },
        orderBy: { rowNumber: "asc" }
      });
      return rows.map((row) => ({
        id: row.id,
        tenantId: row.tenantId,
        importBatchId: row.importBatchId,
        status: row.status,
        normalizedPayload: row.normalizedPayload
      }));
    },

    async findCandidateByFingerprint(tenantId: string, version: string, fingerprint: string): Promise<FiscalCandidateRecord | null> {
      const candidate = await prisma.fiscalCandidate.findUnique({
        where: { tenantId_fiscalFingerprintVersion_fiscalFingerprint: { tenantId, fiscalFingerprintVersion: version, fiscalFingerprint: fingerprint } }
      });
      return candidate ? toFiscalCandidateRecord(candidate) : null;
    },

    async createFiscalCandidate(input: CreateFiscalCandidateInput): Promise<FiscalCandidateRecord> {
      const candidate = await prisma.fiscalCandidate.create({ data: input });
      return toFiscalCandidateRecord(candidate);
    },

    async markImportRowCandidateCreated(id: string, tenantId: string): Promise<void> {
      await prisma.importRow.update({ where: { id_tenantId: { id, tenantId } }, data: { status: "CANDIDATE_CREATED" } });
    },

    async findCandidateById(id: string): Promise<FiscalCandidateRecord | null> {
      const candidate = await prisma.fiscalCandidate.findUnique({ where: { id } });
      return candidate ? toFiscalCandidateRecord(candidate) : null;
    },

    async countOpenBlockingInconsistenciesByCandidateId(candidateId: string, tenantId: string): Promise<number> {
      return prisma.fiscalInconsistency.count({
        where: { candidateId, tenantId, severity: "BLOCKING", status: { in: ["OPEN", "IN_REVIEW"] } }
      });
    },

    async updateFiscalCandidate(input: {
      id: string;
      tenantId: string;
      status: FiscalCandidateStatus;
      reviewedBy?: string;
      reviewedAt?: Date;
      reviewJustification?: string;
    }): Promise<FiscalCandidateRecord> {
      const candidate = await prisma.fiscalCandidate.update({
        where: { id_tenantId: { id: input.id, tenantId: input.tenantId } },
        data: { status: input.status, reviewedBy: input.reviewedBy, reviewedAt: input.reviewedAt, reviewJustification: input.reviewJustification }
      });
      return toFiscalCandidateRecord(candidate);
    },

    async listCandidates(input: {
      tenantId: string;
      status?: FiscalCandidateStatus;
      importBatchId?: string;
    }): Promise<FiscalCandidateListRecord[]> {
      const candidates = await prisma.fiscalCandidate.findMany({
        where: { tenantId: input.tenantId, status: input.status, importBatchId: input.importBatchId },
        include: { _count: { select: { inconsistencies: { where: { status: { in: ["OPEN", "IN_REVIEW"] } } } } } },
        orderBy: { createdAt: "desc" },
        take: 50
      });
      return candidates.map((candidate) => toCandidateListRecord(candidate));
    },

    async findCandidateDetail(input: { tenantId: string; id: string }): Promise<FiscalCandidateDetailRecord | null> {
      const candidate = await prisma.fiscalCandidate.findUnique({
        where: { id_tenantId: { id: input.id, tenantId: input.tenantId } },
        include: {
          inconsistencies: {
            select: {
              id: true,
              tenantId: true,
              type: true,
              severity: true,
              status: true,
              message: true,
              resolutionNote: true,
              createdAt: true,
              resolvedAt: true
            },
            orderBy: { createdAt: "desc" }
          },
          _count: { select: { inconsistencies: { where: { status: { in: ["OPEN", "IN_REVIEW"] } } } } }
        }
      });
      return candidate ? toCandidateDetailRecord(candidate) : null;
    }
  };
}
