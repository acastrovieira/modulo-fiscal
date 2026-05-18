import { NextResponse, type NextRequest } from "next/server";
import { getFiscalGovernanceReport } from "@/modules/observability/application/fiscal-governance-report";
import { createPrismaFiscalGovernanceRepository } from "@/modules/observability/infrastructure/prisma-fiscal-governance-repository";
import {
  fiscalGovernanceQuerySchema,
  toFiscalGovernanceReportDTO
} from "@/modules/observability/presentation/fiscal-governance-schemas";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestId = createCorrelationId();

  try {
    const context = await createCommandContext({ correlationId: requestId });
    const query = fiscalGovernanceQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const report = await getFiscalGovernanceReport({
      context,
      repository: createPrismaFiscalGovernanceRepository(),
      windowDays: query.windowDays
    });

    return NextResponse.json({ data: toFiscalGovernanceReportDTO(report), requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
