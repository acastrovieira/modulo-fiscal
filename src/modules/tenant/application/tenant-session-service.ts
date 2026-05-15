import { ForbiddenError } from "@/shared/errors/application-error";
import type { TenantOptionDTO } from "@/modules/tenant/domain/tenant-admin";
import type { ListTenantOptionsResult, TenantAdminRepository, TenantSwitchInput } from "@/modules/tenant/application/tenant-admin-types";

function toTenantOption(record: Awaited<ReturnType<TenantAdminRepository["listTenantOptions"]>>[number], activeTenantId?: string): TenantOptionDTO {
  return {
    id: record.tenant.id,
    name: record.tenant.name,
    legalName: record.tenant.legalName,
    role: record.role,
    isActive: record.tenant.id === activeTenantId
  };
}

export function createTenantSessionService(repository: TenantAdminRepository) {
  return {
    async listTenantOptions(input: { userId: string; activeTenantId?: string }): Promise<ListTenantOptionsResult> {
      const records = await repository.listTenantOptions(input.userId);
      return { tenants: records.map((record) => toTenantOption(record, input.activeTenantId)) };
    },

    async switchActiveTenant(input: TenantSwitchInput): Promise<TenantOptionDTO> {
      const membership = await repository.findActiveMembership({ userId: input.userId, tenantId: input.targetTenantId });
      if (!membership || membership.tenant.status !== "ACTIVE") {
        throw new ForbiddenError("Tenant is not available for the current user.");
      }

      return toTenantOption(membership, input.targetTenantId);
    }
  };
}
