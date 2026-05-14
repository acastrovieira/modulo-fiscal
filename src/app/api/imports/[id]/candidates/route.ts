import { NextResponse } from "next/server";
import { createFiscalCandidateService, type FiscalCandidateRecord } from "@/modules/fiscal/application/fiscal-candidate-service";
import { createPrismaFiscalCandidateRepository } from "@/modules/fiscal/infrastructure/prisma-fiscal-candidate-repository";
import { audit } from "@/modules/audit/application/audit-service";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function toCreatedCandidateDTO(candidate: FiscalCandidateRecord) {
  return {
    id: candidate.id,
    importBatchId: candidate.importBatchId,
    importRowId: candidate.importRowId,
    documentFileId: candidate.documentFileId,
    customerName: candidate.customerName,
    customerDocumentMasked: candidate.customerDocumentMasked,
    serviceDate: candidate.serviceDate?.toISOString().slice(0, 10) ?? null,
    competenceDate: candidate.competenceDate?.toISOString().slice(0, 10) ?? null,
    serviceDescription: candidate.serviceDescription,
    grossAmountCents: candidate.grossAmountCents?.toString() ?? null,
    status: candidate.status,
    fiscalFingerprintVersion: candidate.fiscalFingerprintVersion,
    reviewedAt: candidate.reviewedAt?.toISOString() ?? null
  };
}

export async function POST(_request: Request, { params }: RouteContext) {
  const requestId = createCorrelationId();

  try {
    const [{ id }, context] = await Promise.all([params, createCommandContext({ correlationId: requestId })]);
    const repository = createPrismaFiscalCandidateRepository();
    const service = createFiscalCandidateService({ repository, audit });
    const candidates = await service.createFiscalCandidatesFromImport({ context, importBatchId: id });
    const data = candidates.map(toCreatedCandidateDTO);

    return NextResponse.json({ data, requestId }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}