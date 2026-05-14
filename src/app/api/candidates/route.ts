import { NextResponse, type NextRequest } from "next/server";
import { listCandidates } from "@/modules/fiscal/application/fiscal-candidate-queries";
import { createPrismaFiscalCandidateRepository } from "@/modules/fiscal/infrastructure/prisma-fiscal-candidate-repository";
import { parseFiscalCandidateStatus } from "@/modules/fiscal/presentation/fiscal-candidate-schemas";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestId = createCorrelationId();

  try {
    const context = await createCommandContext({ correlationId: requestId });
    const status = parseFiscalCandidateStatus(request.nextUrl.searchParams.get("status"));
    const importBatchId = request.nextUrl.searchParams.get("importBatchId") ?? undefined;
    const data = await listCandidates({
      context,
      repository: createPrismaFiscalCandidateRepository(),
      status,
      importBatchId
    });

    return NextResponse.json({ data, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}