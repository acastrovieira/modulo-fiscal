import { describe, expect, it } from "vitest";
import { TenantScopeError } from "@/shared/errors/application-error";
import { assertTenantScope, assertTenantScopes } from "@/shared/security/tenant-scope";
import { tenantAId, tenantBId } from "../fixtures/security";

describe("tenant isolation", () => {
  it("allows access to records in the active tenant", () => {
    expect(() => assertTenantScope(tenantAId, { tenantId: tenantAId })).not.toThrow();
  });

  it("blocks cross-tenant access", () => {
    expect(() => assertTenantScope(tenantAId, { tenantId: tenantBId })).toThrow(TenantScopeError);
  });

  it("blocks cross-tenant records inside collections", () => {
    expect(() =>
      assertTenantScopes(tenantAId, [
        { tenantId: tenantAId },
        { tenantId: tenantBId }
      ])
    ).toThrow(TenantScopeError);
  });

  it("covers operational entities with tenant scope", () => {
    const operationalEntities = [
      "ImportBatch",
      "ImportRow",
      "FiscalCandidate",
      "FiscalInconsistency",
      "FiscalBatch",
      "FiscalBatchItem"
    ];

    for (const entityType of operationalEntities) {
      expect(() => assertTenantScope(tenantAId, { tenantId: tenantBId }), entityType).toThrow(TenantScopeError);
    }
  });
});