import { describe, expect, it } from "vitest";
import { ForbiddenError } from "@/shared/errors/application-error";
import { assertTenantScope } from "@/shared/security/tenant-scope";

describe("tenant isolation", () => {
  it("allows access to records in the active tenant", () => {
    expect(() => assertTenantScope("tenant-1", { tenantId: "tenant-1" })).not.toThrow();
  });

  it("blocks cross-tenant access", () => {
    expect(() => assertTenantScope("tenant-1", { tenantId: "tenant-2" })).toThrow(ForbiddenError);
  });
});
