import { NextResponse } from "next/server";
import { audit } from "@/modules/audit/application/audit-service";
import { recordDocumentDownloadIntent } from "@/modules/documents/application/document-file-queries";
import { createPrismaDocumentFileRepository } from "@/modules/documents/infrastructure/prisma-document-file-repository";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const requestId = createCorrelationId();
  try {
    const [{ id }, context] = await Promise.all([params, createCommandContext({ correlationId: requestId })]);
    const data = await recordDocumentDownloadIntent({ context, repository: createPrismaDocumentFileRepository(), audit, documentFileId: id });
    return NextResponse.json({ data, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
