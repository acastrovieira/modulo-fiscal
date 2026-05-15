import { describe, expect, it } from "vitest";
import { createTenantSessionService } from "@/modules/tenant/application/tenant-session-service";
import type { TenantAdminRepository } from "@/modules/tenant/application/tenant-admin-types";
import { ForbiddenError } from "@/shared/errors/application-error";

function makeRepository(overrides: Partial<TenantAdminRepository> = {}): TenantAdminRepository {
  return {
    async listTenantOptions() {
      return [
        {
          tenantId: "11111111-1111-4111-8111-111111111111",
          role: "OWNER",
          tenant: { id: "11111111-1111-4111-8111-111111111111", name: "Clinica A", legalName: null, status: "ACTIVE" }
        }
      ];
    },
    async findActiveMembership() {
      return {
        tenantId: "11111111-1111-4111-8111-111111111111",
        role: "OWNER",
        tenant: { id: "11111111-1111-4111-8111-111111111111", name: "Clinica A", legalName: null, status: "ACTIVE" }
      };
    },
    async listMembers() { return []; },
    async findMember() { return null; },
    async countActiveOwners() { return 1; },
    async suspendMember() { throw new Error("not used"); },
    async createInvite() { throw new Error("not used"); },
    ...overrides
  };
}

describe("tenant session service", () => {
  it("lists active tenant options for a user", async () => {
    const service = createTenantSessionService(makeRepository());

    await expect(service.listTenantOptions({ userId: "user-1", activeTenantId: "11111111-1111-4111-8111-111111111111" })).resolves.toEqual({
      tenants: [expect.objectContaining({ id: "11111111-1111-4111-8111-111111111111", isActive: true, role: "OWNER" })]
    });
  });

  it("blocks tenant switch without active membership", async () => {
    const service = createTenantSessionService(makeRepository({ async findActiveMembership() { return null; } }));

    await expect(service.switchActiveTenant({ userId: "user-1", targetTenantId: "22222222-2222-4222-8222-222222222222" })).rejects.toBeInstanceOf(ForbiddenError);
  });
});
