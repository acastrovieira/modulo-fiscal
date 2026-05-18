import { NextResponse } from "next/server";
import { createFiscalBatchService } from "@/modules/fiscal/application/fiscal-batch-service";
import { toBatchDTO } from "@/modules/fiscal/application/fiscal-batch-queries";
import { createPrismaFiscalBatchRepository } from "@/modules/fiscal/infrastructure/prisma-fiscal-batch-repository";
import { emptyBatchTransitionRequestSchema } from "@/modules/fiscal/presentation/fiscal-batch-schemas";
import { audit } from "@/modules/audit/application/audit-service";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createPrismaCommandIdempotencyRepository } from "@/shared/idempotency/prisma-command-idempotency-repository";
import { createCorrelationId } from "@/shared/logging/correlation-id";
type RouteContext = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: RouteContext) { const requestId = createCorrelationId(); try { const [{ id }, context] = await Promise.all([params, createCommandContext({ correlationId: requestId })]); emptyBatchTransitionRequestSchema.parse(await request.json().catch(() => ({}))); const repository = createPrismaFiscalBatchRepository(); const service = createFiscalBatchService({ repository, audit, idempotencyRepository: createPrismaCommandIdempotencyRepository() }); const batch = await service.simulateBatchInternally({ context, batchId: id, idempotencyKey: request.headers.get("idempotency-key") }); const data = toBatchDTO({ ...batch, createdAt: new Date(), updatedAt: new Date(), itemsCount: batch.items?.length ?? 0 }); return NextResponse.json({ data, requestId }); } catch (error) { return apiErrorResponse(error, requestId); } }
