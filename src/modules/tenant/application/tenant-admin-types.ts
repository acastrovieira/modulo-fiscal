import type { TenantInviteStatus, MembershipStatus } from "@prisma/client";
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
  user: { id: string; email: string; name: string | null; status: "ACTIVE" | "INVITED" | "DISABLED" };
};

export type TenantInviteRecord = {
  id: string;
  tenantId: string;
  email: string;
  role: Role;
  status: TenantInviteStatus;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
};

export type TenantAdminRepository = {
  listTenantOptions(userId: string): Promise<TenantOptionRecord[]>;
  findActiveMembership(input: { userId: string; tenantId: string }): Promise<TenantOptionRecord | null>;
  listMembers(tenantId: string): Promise<TenantMemberRecord[]>;
  findMember(input: { tenantId: string; membershipId: string }): Promise<TenantMemberRecord | null>;
  countActiveOwners(tenantId: string): Promise<number>;
  suspendMember(input: { tenantId: string; membershipId: string }): Promise<TenantMemberRecord>;
  createInvite(input: {
    tenantId: string;
    email: string;
    role: Role;
    tokenHash: string;
    invitedBy: string;
    expiresAt: Date;
  }): Promise<TenantInviteRecord>;
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

export type ListTenantOptionsResult = {
  tenants: TenantOptionDTO[];
};
