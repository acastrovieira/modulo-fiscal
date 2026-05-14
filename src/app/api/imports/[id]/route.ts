import { NextResponse } from "next/server";
import { getImportDetail } from "@/modules/imports/application/import-queries";
import { createPrismaImportRepository } from "@/modules/imports/infrastructure/prisma-import-repository";
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
    const data = await getImportDetail({ context, repository: createPrismaImportRepository(), importBatchId: id });

    return NextResponse.json({ data, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}