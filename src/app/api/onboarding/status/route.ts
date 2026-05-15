import { NextResponse } from "next/server";
import { createTenantBootstrapService } from "@/modules/tenant/application/tenant-bootstrap-service";
import { createPrismaTenantBootstrapRepository } from "@/modules/tenant/infrastructure/prisma-tenant-bootstrap-repository";
import { audit } from "@/modules/audit/application/audit-service";
import { getSupabaseAuthUser } from "@/shared/auth/supabase-server";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = createCorrelationId();

  try {
    const service = createTenantBootstrapService({ repository: createPrismaTenantBootstrapRepository(), audit });
    const data = await service.getOnboardingStatus({ authUser: await getSupabaseAuthUser() });

    return NextResponse.json({ data, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
