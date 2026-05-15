import { randomBytes, createHash } from "node:crypto";
import type { AuditRecorder } from "@/modules/audit/application/audit-service";
import { maskEmail, normalizeInviteEmail, type TenantInviteDTO, type TenantMemberDTO } from "@/modules/tenant/domain/tenant-admin";
import type { InviteTenantMemberResult, ListTenantMembersResult, TenantAdminRepository, TenantMemberRecord } from "@/modules/tenant/application/tenant-admin-types";
import { assertCommandPermission, createCommandAuditEvent, type CommandContext } from "@/shared/application/command-context";
import { ForbiddenError, InvalidStateError, NotFoundError, ValidationError } from "@/shared/errors/application-error";
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

function toInviteDTO(invite: { id: string; email: string; role: Role; status: TenantInviteDTO["status"]; expiresAt: Date; createdAt: Date }): TenantInviteDTO {
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

export function createTenantMemberService(dependencies: { repository: TenantAdminRepository; audit: AuditRecorder }) {
  const { repository, audit } = dependencies;

  return {
    async listMembers(input: { context: CommandContext }): Promise<ListTenantMembersResult> {
      assertCommandPermission(input.context, "tenant.members.view");
      const members = await repository.listMembers(input.context.tenantId);
      return { members: members.map(toMemberDTO) };
    },

    async inviteMember(input: { context: CommandContext; email: string; role: Role }): Promise<InviteTenantMemberResult> {
      assertCommandPermission(input.context, "tenant.members.invite");
      const email = normalizeInviteEmail(input.email);

      if (!inviteableRoles.includes(input.role)) {
        throw new ValidationError("Role is not inviteable in this workflow.");
      }

      const { tokenHash } = createInviteToken();
      const expiresAt = new Date(Date.now() + inviteTtlMs);
      const invite = await repository.createInvite({
        tenantId: input.context.tenantId,
        email,
        role: input.role,
        tokenHash,
        invitedBy: input.context.actorId,
        expiresAt
      });

      await audit.record(
        createCommandAuditEvent(input.context, {
          eventType: "tenant_member.invited",
          entityType: "TenantInvite",
          entityId: invite.id,
          afterPayload: { role: invite.role, status: invite.status, expiresAt: invite.expiresAt.toISOString() },
          metadata: { emailMasked: maskEmail(email), deliveryStatus: "NOT_CONFIGURED", tokenStoredAsHash: true }
        })
      );

      return { invite: toInviteDTO(invite) };
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
