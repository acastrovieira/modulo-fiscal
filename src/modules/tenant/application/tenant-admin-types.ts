import type { MembershipStatus, TenantInviteStatus, UserStatus } from "@prisma/client";
import type { Role } from "@/shared/security/roles";
import type { CommandContext } from "@/shared/application/command-context";
import type { TenantInviteDTO, TenantMemberDTO, TenantOptionDTO } from "@/modules/tenant/domain/tenant-admin";

export type TenantOptionRecord = {
  tenantId: string;
  role: Role;
  tenant: { id: string; name: string; legalName: string | null; status: "ACTIVE" | "SUSPENDED" | "ARCHIVED" };
};

export type TenantMemberRecord = {
  id: string;
  userId: string;
  tenantId: string;
  role: Role;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; email: string; name: string | null; status: UserStatus };
};

export type TenantInviteRecord = {
  id: string;
  tenantId: string;
  email: string;
  role: Role;
  status: TenantInviteStatus;
  tokenHash: string;
  invitedBy: string | null;
  acceptedBy: string | null;
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tenant?: { id: string; status: "ACTIVE" | "SUSPENDED" | "ARCHIVED" };
};

export type TenantAdminRepository = {
  listTenantOptions(userId: string): Promise<TenantOptionRecord[]>;
  findActiveMembership(input: { userId: string; tenantId: string }): Promise<TenantOptionRecord | null>;
  listMembers(tenantId: string): Promise<TenantMemberRecord[]>;
  findMember(input: { tenantId: string; membershipId: string }): Promise<TenantMemberRecord | null>;
  countActiveOwners(tenantId: string): Promise<number>;
  suspendMember(input: { tenantId: string; membershipId: string }): Promise<TenantMemberRecord>;
  listInvites(tenantId: string): Promise<TenantInviteRecord[]>;
  findInviteById(input: { tenantId: string; inviteId: string }): Promise<TenantInviteRecord | null>;
  findInviteByTokenHash(tokenHash: string): Promise<TenantInviteRecord | null>;
  findInviteByEmail(input: { tenantId: string; email: string; status?: TenantInviteStatus }): Promise<TenantInviteRecord | null>;
  createInvite(input: {
    tenantId: string;
    email: string;
    role: Role;
    tokenHash: string;
    invitedBy: string;
    expiresAt: Date;
  }): Promise<TenantInviteRecord>;
  updateInviteToken(input: { tenantId: string; inviteId: string; tokenHash: string; expiresAt: Date }): Promise<TenantInviteRecord>;
  revokeInvite(input: { tenantId: string; inviteId: string; revokedAt: Date }): Promise<TenantInviteRecord>;
  expireInvite(input: { tenantId: string; inviteId: string }): Promise<TenantInviteRecord>;
  findMembershipByUserTenant(input: { tenantId: string; userId: string }): Promise<TenantMemberRecord | null>;
  acceptInvite(input: {
    invite: TenantInviteRecord;
    user: { id: string; email: string; name: string | null };
    acceptedAt: Date;
  }): Promise<{ invite: TenantInviteRecord; member: TenantMemberRecord }>;
};

export type TenantSwitchInput = {
  userId: string;
  currentTenantId?: string;
  targetTenantId: string;
};

export type TenantMemberServiceInput = {
  context: CommandContext;
};

export type ListTenantMembersResult = {
  members: TenantMemberDTO[];
};

export type InviteTenantMemberResult = {
  invite: TenantInviteDTO;
};

export type ListTenantInvitesResult = {
  invites: TenantInviteDTO[];
};

export type ListTenantOptionsResult = {
  tenants: TenantOptionDTO[];
};
