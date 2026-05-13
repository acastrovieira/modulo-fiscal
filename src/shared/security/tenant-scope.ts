import { TenantScopeError } from "@/shared/errors/application-error";

export type TenantScopedRecord = {
  tenantId: string;
};

export function assertTenantScope(activeTenantId: string, record: TenantScopedRecord): void {
  if (record.tenantId !== activeTenantId) {
    throw new TenantScopeError();
  }
}

export function assertTenantScopes(activeTenantId: string, records: readonly TenantScopedRecord[]): void {
  for (const record of records) {
    assertTenantScope(activeTenantId, record);
  }
}