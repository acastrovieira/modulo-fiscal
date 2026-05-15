import { describe, expect, it, vi } from "vitest";
import { createTenantMemberService } from "@/modules/tenant/application/tenant-member-service";
import type { TenantAdminRepository, TenantMemberRecord } from "@/modules/tenant/application/tenant-admin-types";
import { InvalidStateError, ValidationError, ForbiddenError } from "@/shared/errors/application-error";
import { makeCommandContext, userAId } from "../fixtures/security";

const now = new Date("2026-05-14T12:00:00.000Z");

function makeMember(overrides: Partial<TenantMemberRecord> = {}): TenantMemberRecord {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    tenantId: "11111111-1111-4111-8111-111111111111",
    userId: "00000000-0000-4000-8000-000000000002",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    user: { id: "00000000-0000-4000-8000-000000000002", email: "admin@vetfiscal.local", name: "Admin", status: "ACTIVE" },
    ...overrides
  };
}

function makeRepository(overrides: Partial<TenantAdminRepository> = {}): TenantAdminRepository {
  return {
    async listTenantOptions() { return []; },
    async findActiveMembership() { return null; },
    async listMembers() { return [makeMember()]; },
    async findMember() { return makeMember(); },
    async countActiveOwners() { return 2; },
    async suspendMember() { return makeMember({ status: "SUSPENDED" }); },
    async createInvite(input) {
      return {
        id: "44444444-4444-4444-8444-444444444444",
        tenantId: input.tenantId,
        email: input.email,
        role: input.role,
        status: "PENDING",
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        createdAt: now
      };
    },
    ...overrides
  };
}

function makeAudit() {
  return { record: vi.fn(async () => undefined) };
}

describe("tenant member service", () => {
  it("lists tenant members only for roles with tenant member permission", async () => {
    const service = createTenantMemberService({ repository: makeRepository(), audit: makeAudit() });

    await expect(service.listMembers({ context: makeCommandContext("ADMIN") })).resolves.toEqual({
      members: [expect.objectContaining({ email: "admin@vetfiscal.local", role: "ADMIN", status: "ACTIVE" })]
    });
    await expect(service.listMembers({ context: makeCommandContext("FISCAL_OPERATOR") })).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("records an invite without exposing a raw token in audit metadata", async () => {
    const audit = makeAudit();
    const service = createTenantMemberService({ repository: makeRepository(), audit });

    const result = await service.inviteMember({ context: makeCommandContext("ADMIN"), email: "New.User@VetFiscal.Local", role: "AUDITOR" });

    expect(result.invite).toMatchObject({ emailMasked: "ne***@vetfiscal.local", role: "AUDITOR", deliveryStatus: "NOT_CONFIGURED" });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "tenant_member.invited",
        metadata: expect.objectContaining({ emailMasked: "ne***@vetfiscal.local", tokenStoredAsHash: true })
      })
    );
    expect(JSON.stringify(audit.record.mock.calls)).not.toContain("token=");
  });

  it("does not allow inviting OWNER in the supervised invite workflow", async () => {
    const service = createTenantMemberService({ repository: makeRepository(), audit: makeAudit() });

    await expect(service.inviteMember({ context: makeCommandContext("OWNER"), email: "owner@vetfiscal.local", role: "OWNER" })).rejects.toBeInstanceOf(ValidationError);
  });

  it("blocks self suspension and last owner suspension", async () => {
    const selfService = createTenantMemberService({
      repository: makeRepository({ async findMember() { return makeMember({ userId: userAId }); } }),
      audit: makeAudit()
    });
    await expect(selfService.suspendMember({ context: makeCommandContext("OWNER"), membershipId: "membership-1" })).rejects.toBeInstanceOf(ForbiddenError);

    const lastOwnerService = createTenantMemberService({
      repository: makeRepository({ async findMember() { return makeMember({ role: "OWNER" }); }, async countActiveOwners() { return 1; } }),
      audit: makeAudit()
    });
    await expect(lastOwnerService.suspendMember({ context: makeCommandContext("OWNER"), membershipId: "membership-1" })).rejects.toBeInstanceOf(InvalidStateError);
  });
});
