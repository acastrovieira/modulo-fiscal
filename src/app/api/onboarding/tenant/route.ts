import { NextResponse, type NextRequest } from "next/server";
import { createTenantBootstrapService } from "@/modules/tenant/application/tenant-bootstrap-service";
import { createPrismaTenantBootstrapRepository } from "@/modules/tenant/infrastructure/prisma-tenant-bootstrap-repository";
import { bootstrapTenantRequestSchema } from "@/modules/tenant/presentation/tenant-bootstrap-schemas";
import { audit } from "@/modules/audit/application/audit-service";
import { activeTenantCookieName, createActiveTenantCookieOptions } from "@/shared/auth/active-tenant";
import { getSupabaseAuthUser } from "@/shared/auth/supabase-server";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestId = createCorrelationId();

  try {
    const body = bootstrapTenantRequestSchema.parse(await request.json());
    const idempotencyKey = body.idempotencyKey ?? request.headers.get("idempotency-key") ?? "";
    const service = createTenantBootstrapService({ repository: createPrismaTenantBootstrapRepository(), audit });
    const data = await service.bootstrapTenant({
      authUser: await getSupabaseAuthUser(),
      name: body.name,
      legalName: body.legalName,
      cnpj: body.cnpj,
      idempotencyKey,
      correlationId: requestId
    });

    const response = NextResponse.json({ data, requestId }, { status: 201 });
    response.cookies.set(activeTenantCookieName, data.tenant.id, createActiveTenantCookieOptions());

    return response;
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
