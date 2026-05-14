import { NextResponse } from "next/server";
import { createFiscalInconsistencyService } from "@/modules/fiscal/application/fiscal-inconsistency-service";
import { toInconsistencyDTO } from "@/modules/fiscal/application/fiscal-inconsistency-queries";
import { createPrismaFiscalInconsistencyRepository } from "@/modules/fiscal/infrastructure/prisma-fiscal-inconsistency-repository";
import { closeInconsistencyRequestSchema } from "@/modules/fiscal/presentation/fiscal-inconsistency-schemas";
import { audit } from "@/modules/audit/application/audit-service";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";
type RouteContext = { params: Promise<{ id: string }> };
export async function POST(request: Request, { params }: RouteContext) { const requestId = createCorrelationId(); try { const [{ id }, context, body] = await Promise.all([params, createCommandContext({ correlationId: requestId }), request.json().then((json) => closeInconsistencyRequestSchema.parse(json))]); const repository = createPrismaFiscalInconsistencyRepository(); const service = createFiscalInconsistencyService({ repository, audit }); const row = await service.waiveInconsistency({ context, inconsistencyId: id, resolutionNote: body.resolutionNote }); const data = toInconsistencyDTO({ ...row, createdAt: new Date(), updatedAt: new Date() }); return NextResponse.json({ data, requestId }); } catch (error) { return apiErrorResponse(error, requestId); } }