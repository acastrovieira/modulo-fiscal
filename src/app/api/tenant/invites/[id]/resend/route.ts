import { NextResponse, type NextRequest } from "next/server";
import { audit } from "@/modules/audit/application/audit-service";
import { createTenantMemberService } from "@/modules/tenant/application/tenant-member-service";
import { createPrismaTenantAdminRepository } from "@/modules/tenant/infrastructure/prisma-tenant-admin-repository";
import { emptyInviteLifecycleRequestSchema } from "@/modules/tenant/presentation/tenant-admin-schemas";
import { createCommandContext } from "@/shared/application/command-context";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const requestId = createCorrelationId();

  try {
    emptyInviteLifecycleRequestSchema.parse(await request.json().catch(() => ({})));
    const commandContext = await createCommandContext({ correlationId: requestId });
    const { id } = await context.params;
    const service = createTenantMemberService({ repository: createPrismaTenantAdminRepository(), audit });
    const data = await service.resendInvite({ context: commandContext, inviteId: id });

    return NextResponse.json({ data, requestId });
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
