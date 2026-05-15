import { randomBytes, createHash } from "node:crypto";
import type { AuditRecorder } from "@/modules/audit/application/audit-service";
import { maskEmail, normalizeInviteEmail, type TenantInviteDTO, type TenantMemberDTO } from "@/modules/tenant/domain/tenant-admin";
import type {
  InviteTenantMemberResult,
  ListTenantInvitesResult,
  ListTenantMembersResult,
  TenantAdminRepository,
  TenantInviteRecord,
  TenantMemberRecord
} from "@/modules/tenant/application/tenant-admin-types";
import { assertCommandPermission, createCommandAuditEvent, type CommandContext } from "@/shared/application/command-context";
import { ForbiddenError, InvalidStateError, NotFoundError, UnauthorizedError, ValidationError } from "@/shared/errors/application-error";
import type { AuthProviderUser } from "@/shared/auth/session-types";
import type { Role } from "@/shared/security/roles";

const inviteTtlMs = 1000 * 60 * 60 * 24 * 7;
const inviteableRoles: Role[] = ["ADMIN", "FISCAL_MANAGER", "FISCAL_OPERATOR", "FINANCIAL_OPERATOR", "ACCOUNTANT", "AUDITOR"];

function toMemberDTO(member: TenantMemberRecord): TenantMemberDTO {
  return {
    id: member.id,
    userId: member.userId,
    email: member.user.email,
    name: member.user.name,
    role: member.role,
    status: member.status,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString()
  };
}

function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createInviteToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashInviteToken(token) };
}

function createInviteExpiration(now = new Date()): Date {
  return new Date(now.getTime() + inviteTtlMs);
}

function toInviteDTO(invite: Pick<TenantInviteRecord, "id" | "email" | "role" | "status" | "expiresAt" | "createdAt">): TenantInviteDTO {
  return {
    id: invite.id,
    emailMasked: maskEmail(invite.email),
    role: invite.role,
    status: invite.status,
    expiresAt: invite.expiresAt.toISOString(),
    createdAt: invite.createdAt.toISOString(),
    deliveryStatus: "NOT_CONFIGURED"
  };
}

function assertInviteableRole(role: Role): void {
  if (!inviteableRoles.includes(role)) {
    throw new ValidationError("Role is not inviteable in this workflow.");
  }
}

async function markExpiredInvite(input: { repository: TenantAdminRepository; audit: AuditRecorder; invite: TenantInviteRecord; correlationId: string }): Promise<TenantInviteRecord> {
  if (input.invite.status !== "PENDING" || input.invite.expiresAt.getTime() > Date.now()) {
    return input.invite;
  }

  const expired = await input.repository.expireInvite({ tenantId: input.invite.tenantId, inviteId: input.invite.id });
  await input.audit.record({
    tenantId: expired.tenantId,
    actorId: null,
    correlationId: input.correlationId,
    eventType: "tenant_invite.expired",
    entityType: "TenantInvite",
    entityId: expired.id,
    beforePayload: { status: input.invite.status, expiresAt: input.invite.expiresAt.toISOString() },
    afterPayload: { status: expired.status },
    metadata: { emailMasked: maskEmail(expired.email), role: expired.role }
  });

  return expired;
}

export function createTenantMemberService(dependencies: { repository: TenantAdminRepository; audit: AuditRecorder }) {
  const { repository, audit } = dependencies;

  return {
    async listMembers(input: { context: CommandContext }): Promise<ListTenantMembersResult> {
      assertCommandPermission(input.context, "tenant.members.view");
      const members = await repository.listMembers(input.context.tenantId);
      return { members: members.map(toMemberDTO) };
    },

    async listInvites(input: { context: CommandContext }): Promise<ListTenantInvitesResult> {
      assertCommandPermission(input.context, "tenant.members.invite");
      const invites = await repository.listInvites(input.context.tenantId);
      return { invites: invites.map(toInviteDTO) };
    },

    async inviteMember(input: { context: CommandContext; email: string; role: Role }): Promise<InviteTenantMemberResult> {
      assertCommandPermission(input.context, "tenant.members.invite");
      assertInviteableRole(input.role);
      const email = normalizeInviteEmail(input.email);
      const existingPendingInvite = await repository.findInviteByEmail({ tenantId: input.context.tenantId, email, status: "PENDING" });

      if (existingPendingInvite) {
        return { invite: toInviteDTO(existingPendingInvite) };
      }

      const { tokenHash } = createInviteToken();
      const invite = await repository.createInvite({
        tenantId: input.context.tenantId,
        email,
        role: input.role,
        tokenHash,
        invitedBy: input.context.actorId,
        expiresAt: createInviteExpiration()
      });

      await audit.record(
        createCommandAuditEvent(input.context, {
          eventType: "tenant_invite.created",
          entityType: "TenantInvite",
          entityId: invite.id,
          afterPayload: { role: invite.role, status: invite.status, expiresAt: invite.expiresAt.toISOString() },
          metadata: { emailMasked: maskEmail(email), deliveryStatus: "NOT_CONFIGURED", tokenStoredAsHash: true }
        })
      );

      return { invite: toInviteDTO(invite) };
    },

    async revokeInvite(input: { context: CommandContext; inviteId: string }): Promise<{ invite: TenantInviteDTO }> {
      assertCommandPermission(input.context, "tenant.invites.revoke");
      const invite = await repository.findInviteById({ tenantId: input.context.tenantId, inviteId: input.inviteId });
      if (!invite) {
        throw new NotFoundError("Invite not found.");
      }

      if (invite.status === "REVOKED") {
        return { invite: toInviteDTO(invite) };
      }

      if (invite.status !== "PENDING") {
        throw new InvalidStateError("Only pending invites can be revoked.");
      }

      const revoked = await repository.revokeInvite({ tenantId: input.context.tenantId, inviteId: input.inviteId, revokedAt: new Date() });
      await audit.record(
        createCommandAuditEvent(input.context, {
          eventType: "tenant_invite.revoked",
          entityType: "TenantInvite",
          entityId: revoked.id,
          beforePayload: { status: invite.status, role: invite.role, expiresAt: invite.expiresAt.toISOString() },
          afterPayload: { status: revoked.status, revokedAt: revoked.revokedAt?.toISOString() ?? null },
          metadata: { emailMasked: maskEmail(revoked.email) }
        })
      );

      return { invite: toInviteDTO(revoked) };
    },

    async resendInvite(input: { context: CommandContext; inviteId: string }): Promise<{ invite: TenantInviteDTO }> {
      assertCommandPermission(input.context, "tenant.invites.resend");
      const invite = await repository.findInviteById({ tenantId: input.context.tenantId, inviteId: input.inviteId });
      if (!invite) {
        throw new NotFoundError("Invite not found.");
      }

      if (invite.status === "ACCEPTED" || invite.status === "REVOKED") {
        throw new InvalidStateError("Invite cannot be resent from its current state.");
      }

      const { tokenHash } = createInviteToken();
      const resent = await repository.updateInviteToken({
        tenantId: input.context.tenantId,
        inviteId: input.inviteId,
        tokenHash,
        expiresAt: createInviteExpiration()
      });

      await audit.record(
        createCommandAuditEvent(input.context, {
          eventType: "tenant_invite.resent",
          entityType: "TenantInvite",
          entityId: resent.id,
          beforePayload: { status: invite.status, expiresAt: invite.expiresAt.toISOString() },
          afterPayload: { status: resent.status, expiresAt: resent.expiresAt.toISOString() },
          metadata: { emailMasked: maskEmail(resent.email), tokenRegenerated: true, tokenStoredAsHash: true, deliveryStatus: "NOT_CONFIGURED" }
        })
      );

      return { invite: toInviteDTO(resent) };
    },

    async acceptInvite(input: { authUser: AuthProviderUser | null; token: string; correlationId: string }): Promise<{ invite: TenantInviteDTO; member: TenantMemberDTO }> {
      if (!input.authUser?.id || !input.authUser.email) {
        throw new UnauthorizedError("Authentication is required to accept an invite.");
      }

      const tokenHash = hashInviteToken(input.token);
      const invite = await repository.findInviteByTokenHash(tokenHash);
      if (!invite) {
        throw new NotFoundError("Invite not found.");
      }

      if (invite.tenant?.status !== "ACTIVE") {
        throw new ForbiddenError("Invite is not available.");
      }

      if (invite.status === "ACCEPTED" && invite.acceptedBy === input.authUser.id) {
        const member = await repository.findMembershipByUserTenant({ tenantId: invite.tenantId, userId: input.authUser.id });
        if (!member) {
          throw new InvalidStateError("Accepted invite membership is missing.");
        }
        return { invite: toInviteDTO(invite), member: toMemberDTO(member) };
      }

      if (invite.status !== "PENDING") {
        throw new InvalidStateError("Invite is not pending.");
      }

      const currentInvite = await markExpiredInvite({ repository, audit, invite, correlationId: input.correlationId });
      if (currentInvite.status !== "PENDING") {
        throw new InvalidStateError("Invite is expired.");
      }

      const email = normalizeInviteEmail(input.authUser.email);
      if (email !== currentInvite.email) {
        throw new ForbiddenError("Invite is not available for the authenticated user.");
      }

      const existingMembership = await repository.findMembershipByUserTenant({ tenantId: currentInvite.tenantId, userId: input.authUser.id });
      if (existingMembership?.status === "ACTIVE") {
        throw new InvalidStateError("User already has an active membership for this tenant.");
      }
      if (existingMembership?.status === "SUSPENDED") {
        throw new InvalidStateError("Suspended memberships cannot be reactivated by invite accept.");
      }

      const accepted = await repository.acceptInvite({
        invite: currentInvite,
        user: { id: input.authUser.id, email, name: input.authUser.name },
        acceptedAt: new Date()
      });

      await audit.record({
        tenantId: accepted.invite.tenantId,
        actorId: input.authUser.id,
        correlationId: input.correlationId,
        eventType: "tenant_invite.accepted",
        entityType: "TenantInvite",
        entityId: accepted.invite.id,
        beforePayload: { status: currentInvite.status, role: currentInvite.role },
        afterPayload: { status: accepted.invite.status, acceptedAt: accepted.invite.acceptedAt?.toISOString() ?? null },
        metadata: { emailMasked: maskEmail(email), membershipId: accepted.member.id, role: accepted.member.role }
      });

      return { invite: toInviteDTO(accepted.invite), member: toMemberDTO(accepted.member) };
    },

    async suspendMember(input: { context: CommandContext; membershipId: string }): Promise<{ member: TenantMemberDTO }> {
      assertCommandPermission(input.context, "tenant.members.suspend");
      const member = await repository.findMember({ tenantId: input.context.tenantId, membershipId: input.membershipId });
      if (!member) {
        throw new NotFoundError("Membership not found.");
      }

      if (member.userId === input.context.actorId) {
        throw new ForbiddenError("Users cannot suspend their own membership.");
      }

      if (member.status !== "ACTIVE") {
        throw new InvalidStateError("Only active memberships can be suspended.");
      }

      if (member.role === "OWNER" && (await repository.countActiveOwners(input.context.tenantId)) <= 1) {
        throw new InvalidStateError("Cannot suspend the last active owner.");
      }

      const suspended = await repository.suspendMember({ tenantId: input.context.tenantId, membershipId: input.membershipId });

      await audit.record(
        createCommandAuditEvent(input.context, {
          eventType: "tenant_member.suspended",
          entityType: "TenantMembership",
          entityId: suspended.id,
          beforePayload: { role: member.role, status: member.status },
          afterPayload: { role: suspended.role, status: suspended.status },
          metadata: { targetUserId: suspended.userId }
        })
      );

      return { member: toMemberDTO(suspended) };
    }
  };
}

export const tenantInvitePolicy = { inviteableRoles, inviteTtlMs, hashInviteToken };
