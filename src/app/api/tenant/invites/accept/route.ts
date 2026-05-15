import { NextResponse, type NextRequest } from "next/server";
import { audit } from "@/modules/audit/application/audit-service";
import { createTenantMemberService } from "@/modules/tenant/application/tenant-member-service";
import { createPrismaTenantAdminRepository } from "@/modules/tenant/infrastructure/prisma-tenant-admin-repository";
import { acceptTenantInviteRequestSchema } from "@/modules/tenant/presentation/tenant-admin-schemas";
import { getSupabaseAuthUser } from "@/shared/auth/supabase-server";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestId = createCorrelationId();

  try {
    const body = acceptTenantInviteRequestSchema.parse(await request.json());
    const service = createTenantMemberService({ repository: createPrismaTenantAdminRepository(), audit });
    const data = await service.acceptInvite({ authUser: await getSupabaseAuthUser(), token: body.token, correlationId: requestId });

    return NextResponse.json({ data, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
