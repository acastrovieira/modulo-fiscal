import { NextResponse, type NextRequest } from "next/server";
import { createFiscalBatchService } from "@/modules/fiscal/application/fiscal-batch-service";
import { listBatches, toBatchDTO } from "@/modules/fiscal/application/fiscal-batch-queries";
import { createPrismaFiscalBatchRepository } from "@/modules/fiscal/infrastructure/prisma-fiscal-batch-repository";
import { createBatchRequestSchema, parseBatchStatus } from "@/modules/fiscal/presentation/fiscal-batch-schemas";
import { audit } from "@/modules/audit/application/audit-service";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createPrismaCommandIdempotencyRepository } from "@/shared/idempotency/prisma-command-idempotency-repository";
import { createCorrelationId } from "@/shared/logging/correlation-id";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) { const requestId = createCorrelationId(); try { const context = await createCommandContext({ correlationId: requestId }); const data = await listBatches({ context, repository: createPrismaFiscalBatchRepository(), status: parseBatchStatus(request.nextUrl.searchParams.get("status")) }); return NextResponse.json({ data, requestId }); } catch (error) { return apiErrorResponse(error, requestId); } }
export async function POST(request: Request) { const requestId = createCorrelationId(); try { const context = await createCommandContext({ correlationId: requestId }); const body = createBatchRequestSchema.parse(await request.json()); const repository = createPrismaFiscalBatchRepository(); const service = createFiscalBatchService({ repository, audit, idempotencyRepository: createPrismaCommandIdempotencyRepository() }); const batch = await service.createFiscalBatch({ context, candidateIds: body.candidateIds, batchNumber: body.batchNumber, idempotencyKey: request.headers.get("idempotency-key") }); const data = toBatchDTO({ ...batch, createdAt: new Date(), updatedAt: new Date(), itemsCount: batch.items?.length ?? 0 }); return NextResponse.json({ data, requestId }, { status: 201 }); } catch (error) { return apiErrorResponse(error, requestId); } }
