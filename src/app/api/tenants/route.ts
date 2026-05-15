import { NextResponse } from "next/server";
import { createTenantSessionService } from "@/modules/tenant/application/tenant-session-service";
import { createPrismaTenantAdminRepository } from "@/modules/tenant/infrastructure/prisma-tenant-admin-repository";
import { currentSession } from "@/shared/auth/current-session";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = createCorrelationId();

  try {
    const { user, tenant } = await currentSession();
    const service = createTenantSessionService(createPrismaTenantAdminRepository());
    const data = await service.listTenantOptions({ userId: user.id, activeTenantId: tenant.id });

    return NextResponse.json({ data, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
