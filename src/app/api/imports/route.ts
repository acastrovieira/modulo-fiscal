import { NextResponse, type NextRequest } from "next/server";
import { createImportService } from "@/modules/imports/application/import-service";
import { listImports } from "@/modules/imports/application/import-queries";
import { createPrismaImportRepository } from "@/modules/imports/infrastructure/prisma-import-repository";
import { createImportRequestSchema, parseImportStatus } from "@/modules/imports/presentation/import-schemas";
import { audit } from "@/modules/audit/application/audit-service";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestId = createCorrelationId();

  try {
    const context = await createCommandContext({ correlationId: requestId });
    const repository = createPrismaImportRepository();
    const status = parseImportStatus(request.nextUrl.searchParams.get("status"));
    const data = await listImports({ context, repository, status });

    return NextResponse.json({ data, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}

export async function POST(request: NextRequest) {
  const requestId = createCorrelationId();

  try {
    const context = await createCommandContext({ correlationId: requestId });
    const body = createImportRequestSchema.parse(await request.json());
    const repository = createPrismaImportRepository();
    const service = createImportService({ repository, audit });
    const idempotencyKey = request.headers.get("idempotency-key") ?? body.idempotencyKey;
    const data = await service.createImportFromDocument({
      context,
      documentFileId: body.documentFileId,
      sourceName: body.sourceName,
      idempotencyKey
    });

    return NextResponse.json({ data, requestId }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}