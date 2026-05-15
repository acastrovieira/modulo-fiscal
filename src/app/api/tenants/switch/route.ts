import { NextResponse, type NextRequest } from "next/server";
import { audit } from "@/modules/audit/application/audit-service";
import { createTenantSessionService } from "@/modules/tenant/application/tenant-session-service";
import { createPrismaTenantAdminRepository } from "@/modules/tenant/infrastructure/prisma-tenant-admin-repository";
import { switchTenantRequestSchema } from "@/modules/tenant/presentation/tenant-admin-schemas";
import { assertCommandPermission, createCommandAuditEvent } from "@/shared/application/command-context";
import { activeTenantCookieName, createActiveTenantCookieOptions } from "@/shared/auth/active-tenant";
import { currentSession } from "@/shared/auth/current-session";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestId = createCorrelationId();

  try {
    const { user, tenant } = await currentSession();
    const context = { tenantId: tenant.id, actorId: user.id, actorRole: tenant.role, correlationId: requestId };
    assertCommandPermission(context, "tenant.switch");

    const body = switchTenantRequestSchema.parse(await request.json());
    const service = createTenantSessionService(createPrismaTenantAdminRepository());
    const data = await service.switchActiveTenant({ userId: user.id, currentTenantId: tenant.id, targetTenantId: body.tenantId });

    await audit.record(
      createCommandAuditEvent(context, {
        eventType: "tenant.switched",
        entityType: "Tenant",
        entityId: data.id,
        beforePayload: { tenantId: tenant.id },
        afterPayload: { tenantId: data.id },
        metadata: { cookie: activeTenantCookieName }
      })
    );

    const response = NextResponse.json({ data, requestId });
    response.cookies.set(activeTenantCookieName, data.id, createActiveTenantCookieOptions());

    return response;
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
