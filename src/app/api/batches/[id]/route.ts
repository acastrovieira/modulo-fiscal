import { NextResponse } from "next/server";
import { getBatch } from "@/modules/fiscal/application/fiscal-batch-queries";
import { createPrismaFiscalBatchRepository } from "@/modules/fiscal/infrastructure/prisma-fiscal-batch-repository";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";
type RouteContext = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: RouteContext) { const requestId = createCorrelationId(); try { const [{ id }, context] = await Promise.all([params, createCommandContext({ correlationId: requestId })]); const data = await getBatch({ context, repository: createPrismaFiscalBatchRepository(), batchId: id }); return NextResponse.json({ data, requestId }); } catch (error) { return apiErrorResponse(error, requestId); } }