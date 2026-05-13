import { ForbiddenError } from "@/shared/errors/application-error";

export type TenantScopedRecord = {
  tenantId: string;
};

export function assertTenantScope(activeTenantId: string, record: TenantScopedRecord): void {
  if (record.tenantId !== activeTenantId) {
    throw new ForbiddenError("Record does not belong to the active tenant.");
  }
}
