import { describe, expect, it, vi } from "vitest";
import { createTenantMemberService, tenantInvitePolicy } from "@/modules/tenant/application/tenant-member-service";
import type { TenantAdminRepository, TenantInviteRecord, TenantMemberRecord } from "@/modules/tenant/application/tenant-admin-types";
import { ForbiddenError, InvalidStateError, ValidationError } from "@/shared/errors/application-error";
import { makeCommandContext, tenantAId, userAId } from "../fixtures/security";

const now = new Date("2026-05-14T12:00:00.000Z");
const later = new Date("2099-05-21T12:00:00.000Z");
const inviteToken = "abcdefghijklmnopqrstuvwxyzABCDEFGH1234567890_-";
const inviteTokenHash = tenantInvitePolicy.hashInviteToken(inviteToken);

function makeMember(overrides: Partial<TenantMemberRecord> = {}): TenantMemberRecord {
  return {
    id: "33333333-3333-4333-8333-333333333333",
    tenantId: tenantAId,
    userId: "00000000-0000-4000-8000-000000000002",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
    user: { id: "00000000-0000-4000-8000-000000000002", email: "admin@vetfiscal.local", name: "Admin", status: "ACTIVE" },
    ...overrides
  };
}

function makeInvite(overrides: Partial<TenantInviteRecord> = {}): TenantInviteRecord {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    tenantId: tenantAId,
    email: "new.user@vetfiscal.local",
    role: "AUDITOR",
    status: "PENDING",
    tokenHash: inviteTokenHash,
    invitedBy: userAId,
    acceptedBy: null,
    expiresAt: later,
    acceptedAt: null,
    revokedAt: null,
    createdAt: now,
    updatedAt: now,
    tenant: { id: tenantAId, status: "ACTIVE" },
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
    async listInvites() { return [makeInvite()]; },
    async findInviteById() { return makeInvite(); },
    async findInviteByTokenHash() { return makeInvite(); },
    async findInviteByEmail() { return null; },
    async createInvite(input) { return makeInvite({ tenantId: input.tenantId, email: input.email, role: input.role, tokenHash: input.tokenHash, expiresAt: input.expiresAt }); },
    async updateInviteToken(input) { return makeInvite({ tokenHash: input.tokenHash, expiresAt: input.expiresAt }); },
    async revokeInvite(input) { return makeInvite({ status: "REVOKED", revokedAt: input.revokedAt }); },
    async expireInvite() { return makeInvite({ status: "EXPIRED", expiresAt: new Date("2026-01-01T00:00:00.000Z") }); },
    async findMembershipByUserTenant() { return null; },
    async acceptInvite(input) {
      const member = makeMember({ tenantId: input.invite.tenantId, userId: input.user.id, role: input.invite.role, status: "ACTIVE", user: { id: input.user.id, email: input.user.email, name: input.user.name, status: "ACTIVE" } });
      return { invite: makeInvite({ status: "ACCEPTED", acceptedBy: input.user.id, acceptedAt: input.acceptedAt }), member };
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
        eventType: "tenant_invite.created",
        metadata: expect.objectContaining({ emailMasked: "ne***@vetfiscal.local", tokenStoredAsHash: true })
      })
    );
    expect(JSON.stringify(audit.record.mock.calls)).not.toContain(inviteToken);
  });

  it("does not allow inviting OWNER in the supervised invite workflow", async () => {
    const service = createTenantMemberService({ repository: makeRepository(), audit: makeAudit() });

    await expect(service.inviteMember({ context: makeCommandContext("OWNER"), email: "owner@vetfiscal.local", role: "OWNER" })).rejects.toBeInstanceOf(ValidationError);
  });

  it("resends pending or expired invites by rotating the stored hash", async () => {
    const audit = makeAudit();
    let capturedHash = inviteTokenHash;
    const service = createTenantMemberService({
      repository: makeRepository({
        async findInviteById() { return makeInvite({ status: "EXPIRED" }); },
        async updateInviteToken(input) { capturedHash = input.tokenHash; return makeInvite({ tokenHash: input.tokenHash, expiresAt: input.expiresAt, status: "PENDING" }); }
      }),
      audit
    });

    await expect(service.resendInvite({ context: makeCommandContext("ADMIN"), inviteId: "invite-1" })).resolves.toEqual({
      invite: expect.objectContaining({ status: "PENDING", deliveryStatus: "NOT_CONFIGURED" })
    });
    expect(capturedHash).not.toBe(inviteTokenHash);
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "tenant_invite.resent" }));
  });

  it("revokes pending invites idempotently without accepting terminal states", async () => {
    const service = createTenantMemberService({ repository: makeRepository(), audit: makeAudit() });

    await expect(service.revokeInvite({ context: makeCommandContext("ADMIN"), inviteId: "invite-1" })).resolves.toEqual({
      invite: expect.objectContaining({ status: "REVOKED" })
    });

    const acceptedService = createTenantMemberService({ repository: makeRepository({ async findInviteById() { return makeInvite({ status: "ACCEPTED" }); } }), audit: makeAudit() });
    await expect(acceptedService.revokeInvite({ context: makeCommandContext("ADMIN"), inviteId: "invite-1" })).rejects.toBeInstanceOf(InvalidStateError);
  });

  it("accepts a pending invite for the authenticated user email", async () => {
    const audit = makeAudit();
    const service = createTenantMemberService({ repository: makeRepository(), audit });

    const result = await service.acceptInvite({
      authUser: { id: "00000000-0000-4000-8000-000000000099", email: "New.User@VetFiscal.Local", name: "New User" },
      token: inviteToken,
      correlationId: "corr_invite"
    });

    expect(result.member).toMatchObject({ status: "ACTIVE", role: "AUDITOR" });
    expect(result.invite).toMatchObject({ status: "ACCEPTED" });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "tenant_invite.accepted" }));
    expect(JSON.stringify(audit.record.mock.calls)).not.toContain(inviteToken);
  });

  it("blocks accept when authenticated email differs or membership is suspended", async () => {
    const service = createTenantMemberService({ repository: makeRepository(), audit: makeAudit() });
    await expect(service.acceptInvite({ authUser: { id: "user-2", email: "other@vetfiscal.local", name: null }, token: inviteToken, correlationId: "corr" })).rejects.toBeInstanceOf(ForbiddenError);

    const suspendedService = createTenantMemberService({ repository: makeRepository({ async findMembershipByUserTenant() { return makeMember({ status: "SUSPENDED" }); } }), audit: makeAudit() });
    await expect(suspendedService.acceptInvite({ authUser: { id: "user-2", email: "new.user@vetfiscal.local", name: null }, token: inviteToken, correlationId: "corr" })).rejects.toBeInstanceOf(InvalidStateError);
  });

  it("expires pending invites before accepting them", async () => {
    const audit = makeAudit();
    const service = createTenantMemberService({
      repository: makeRepository({ async findInviteByTokenHash() { return makeInvite({ expiresAt: new Date("2026-01-01T00:00:00.000Z") }); } }),
      audit
    });

    await expect(service.acceptInvite({ authUser: { id: "user-2", email: "new.user@vetfiscal.local", name: null }, token: inviteToken, correlationId: "corr" })).rejects.toBeInstanceOf(InvalidStateError);
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "tenant_invite.expired" }));
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
