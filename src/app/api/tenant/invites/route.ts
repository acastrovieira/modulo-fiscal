import { NextResponse, type NextRequest } from "next/server";
import { audit } from "@/modules/audit/application/audit-service";
import { createTenantMemberService } from "@/modules/tenant/application/tenant-member-service";
import { createPrismaTenantAdminRepository } from "@/modules/tenant/infrastructure/prisma-tenant-admin-repository";
import { inviteTenantMemberRequestSchema } from "@/modules/tenant/presentation/tenant-admin-schemas";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const requestId = createCorrelationId();

  try {
    const context = await createCommandContext({ correlationId: requestId });
    const body = inviteTenantMemberRequestSchema.parse(await request.json());
    const service = createTenantMemberService({ repository: createPrismaTenantAdminRepository(), audit });
    const data = await service.inviteMember({ context, email: body.email, role: body.role });

    return NextResponse.json({ data, requestId }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
