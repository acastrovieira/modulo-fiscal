import type { FiscalCandidateReviewBlockReason, FiscalCandidateReviewWarning, FiscalCandidateStatus } from "@/modules/fiscal/domain/fiscal-candidate";
import { assertCommandPermission, type CommandContext } from "@/shared/application/command-context";
import { NotFoundError } from "@/shared/errors/application-error";
import { assertTenantScope } from "@/shared/security/tenant-scope";

export type FiscalCandidateListRecord = {
  id: string;
  tenantId: string;
  importBatchId: string;
  importRowId: string | null;
  documentFileId: string | null;
  customerName: string | null;
  customerDocumentMasked: string | null;
  serviceDate: Date | null;
  competenceDate: Date | null;
  serviceDescription: string | null;
  grossAmountCents: bigint | null;
  status: FiscalCandidateStatus;
  fiscalFingerprintVersion: string;
  reviewBlockReasons: FiscalCandidateReviewBlockReason[];
  reviewWarnings: FiscalCandidateReviewWarning[];
  reviewJustification: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  openInconsistenciesCount: number;
};

export type FiscalCandidateInconsistencyRecord = {
  id: string;
  tenantId: string;
  type: string;
  severity: string;
  status: string;
  message: string;
  resolutionNote: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
};

export type FiscalCandidateDetailRecord = FiscalCandidateListRecord & {
  inconsistencies: FiscalCandidateInconsistencyRecord[];
};

export type CandidateListItemDTO = {
  id: string;
  importBatchId: string;
  importRowId: string | null;
  documentFileId: string | null;
  customerName: string | null;
  customerDocumentMasked: string | null;
  serviceDate: string | null;
  competenceDate: string | null;
  serviceDescription: string | null;
  grossAmountCents: string | null;
  status: FiscalCandidateStatus;
  fiscalFingerprintVersion: string;
  reviewBlockReasons: FiscalCandidateReviewBlockReason[];
  reviewWarnings: FiscalCandidateReviewWarning[];
  reviewJustification: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  openInconsistenciesCount: number;
};

export type CandidateReviewDTO = CandidateListItemDTO & {
  inconsistencies: Array<{
    id: string;
    type: string;
    severity: string;
    status: string;
    message: string;
    resolutionNote: string | null;
    createdAt: string;
    resolvedAt: string | null;
  }>;
};

export type FiscalCandidateQueryRepository = {
  listCandidates(input: {
    tenantId: string;
    status?: FiscalCandidateStatus;
    importBatchId?: string;
  }): Promise<FiscalCandidateListRecord[]>;
  findCandidateDetail(input: { tenantId: string; id: string }): Promise<FiscalCandidateDetailRecord | null>;
};

function dateOnly(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

export function toCandidateListItemDTO(record: FiscalCandidateListRecord): CandidateListItemDTO {
  return {
    id: record.id,
    importBatchId: record.importBatchId,
    importRowId: record.importRowId,
    documentFileId: record.documentFileId,
    customerName: record.customerName,
    customerDocumentMasked: record.customerDocumentMasked,
    serviceDate: dateOnly(record.serviceDate),
    competenceDate: dateOnly(record.competenceDate),
    serviceDescription: record.serviceDescription,
    grossAmountCents: record.grossAmountCents?.toString() ?? null,
    status: record.status,
    fiscalFingerprintVersion: record.fiscalFingerprintVersion,
    reviewBlockReasons: record.reviewBlockReasons,
    reviewWarnings: record.reviewWarnings,
    reviewJustification: record.reviewJustification,
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    openInconsistenciesCount: record.openInconsistenciesCount
  };
}

export function toCandidateReviewDTO(record: FiscalCandidateDetailRecord): CandidateReviewDTO {
  return {
    ...toCandidateListItemDTO(record),
    inconsistencies: record.inconsistencies.map((inconsistency) => {
      assertTenantScope(record.tenantId, inconsistency);
      return {
        id: inconsistency.id,
        type: inconsistency.type,
        severity: inconsistency.severity,
        status: inconsistency.status,
        message: inconsistency.message,
        resolutionNote: inconsistency.resolutionNote,
        createdAt: inconsistency.createdAt.toISOString(),
        resolvedAt: inconsistency.resolvedAt?.toISOString() ?? null
      };
    })
  };
}

export async function listCandidates(input: {
  context: CommandContext;
  repository: FiscalCandidateQueryRepository;
  status?: FiscalCandidateStatus;
  importBatchId?: string;
}): Promise<CandidateListItemDTO[]> {
  assertCommandPermission(input.context, "candidates.view");

  const candidates = await input.repository.listCandidates({
    tenantId: input.context.tenantId,
    status: input.status,
    importBatchId: input.importBatchId
  });

  return candidates.map((candidate) => {
    assertTenantScope(input.context.tenantId, candidate);
    return toCandidateListItemDTO(candidate);
  });
}

export async function getCandidateReview(input: {
  context: CommandContext;
  repository: FiscalCandidateQueryRepository;
  candidateId: string;
}): Promise<CandidateReviewDTO> {
  assertCommandPermission(input.context, "candidates.view");

  const candidate = await input.repository.findCandidateDetail({ tenantId: input.context.tenantId, id: input.candidateId });
  if (!candidate) {
    throw new NotFoundError("Fiscal candidate not found.");
  }

  assertTenantScope(input.context.tenantId, candidate);
  return toCandidateReviewDTO(candidate);
}
