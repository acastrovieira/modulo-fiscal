import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listDocumentFiles } from "@/modules/documents/application/document-file-queries";
import { createPrismaDocumentFileRepository } from "@/modules/documents/infrastructure/prisma-document-file-repository";
import { parseDocumentFileQuery } from "@/modules/documents/presentation/document-file-schemas";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export async function GET(request: NextRequest) {
  const requestId = createCorrelationId();
  try {
    const context = await createCommandContext({ correlationId: requestId });
    const filters = parseDocumentFileQuery(request.nextUrl.searchParams);
    const data = await listDocumentFiles({ context, repository: createPrismaDocumentFileRepository(), filters });
    return NextResponse.json({ data, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}

