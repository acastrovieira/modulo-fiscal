export type EntityId = string;

export type TenantScopedEntity = {
  id: EntityId;
  tenantId: EntityId;
};
