import { NextResponse } from "next/server";
import { createImportService } from "@/modules/imports/application/import-service";
import { createPrismaImportRepository } from "@/modules/imports/infrastructure/prisma-import-repository";
import { validateImportRequestSchema } from "@/modules/imports/presentation/import-schemas";
import { audit } from "@/modules/audit/application/audit-service";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const requestId = createCorrelationId();

  try {
    const [{ id }, context, body] = await Promise.all([
      params,
      createCommandContext({ correlationId: requestId }),
      request.json().then((json) => validateImportRequestSchema.parse(json))
    ]);
    const repository = createPrismaImportRepository();
    const service = createImportService({ repository, audit });
    const data = await service.validateImport({ context, importBatchId: id, rows: body.rows, parserVersion: body.parserVersion });

    return NextResponse.json({ data, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
