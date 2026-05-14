import { NextResponse } from "next/server";
import { getInconsistency } from "@/modules/fiscal/application/fiscal-inconsistency-queries";
import { createPrismaFiscalInconsistencyRepository } from "@/modules/fiscal/infrastructure/prisma-fiscal-inconsistency-repository";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";
type RouteContext = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: RouteContext) { const requestId = createCorrelationId(); try { const [{ id }, context] = await Promise.all([params, createCommandContext({ correlationId: requestId })]); const data = await getInconsistency({ context, repository: createPrismaFiscalInconsistencyRepository(), inconsistencyId: id }); return NextResponse.json({ data, requestId }); } catch (error) { return apiErrorResponse(error, requestId); } }