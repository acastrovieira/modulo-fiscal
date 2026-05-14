import { NextResponse } from "next/server";
import { getCandidateReview } from "@/modules/fiscal/application/fiscal-candidate-queries";
import { createPrismaFiscalCandidateRepository } from "@/modules/fiscal/infrastructure/prisma-fiscal-candidate-repository";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const requestId = createCorrelationId();

  try {
    const [{ id }, context] = await Promise.all([params, createCommandContext({ correlationId: requestId })]);
    const data = await getCandidateReview({
      context,
      repository: createPrismaFiscalCandidateRepository(),
      candidateId: id
    });

    return NextResponse.json({ data, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}