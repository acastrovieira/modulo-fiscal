import { NextResponse } from "next/server";
import { createFiscalCandidateService } from "@/modules/fiscal/application/fiscal-candidate-service";
import { readyForBatchRequestSchema } from "@/modules/fiscal/presentation/fiscal-candidate-schemas";
import { createPrismaFiscalCandidateRepository } from "@/modules/fiscal/infrastructure/prisma-fiscal-candidate-repository";
import { audit } from "@/modules/audit/application/audit-service";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createPrismaCommandIdempotencyRepository } from "@/shared/idempotency/prisma-command-idempotency-repository";
import { createCorrelationId } from "@/shared/logging/correlation-id";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function toReadyForBatchResponse(candidate: Awaited<ReturnType<ReturnType<typeof createFiscalCandidateService>["markCandidateReadyForBatch"]>>) {
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

export async function POST(request: Request, { params }: RouteContext) {
  const requestId = createCorrelationId();

  try {
    const [{ id }, context] = await Promise.all([params, createCommandContext({ correlationId: requestId })]);
    readyForBatchRequestSchema.parse(await request.json().catch(() => ({})));

    const repository = createPrismaFiscalCandidateRepository();
    const service = createFiscalCandidateService({
      repository,
      audit,
      idempotencyRepository: createPrismaCommandIdempotencyRepository()
    });
    const candidate = await service.markCandidateReadyForBatch({
      context,
      candidateId: id,
      idempotencyKey: request.headers.get("idempotency-key")
    });

    return NextResponse.json({ data: toReadyForBatchResponse(candidate), requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
