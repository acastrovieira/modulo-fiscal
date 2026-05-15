import type { Prisma } from "@prisma/client";
import type { TenantAdminRepository } from "@/modules/tenant/application/tenant-admin-types";
import { prisma } from "@/shared/database/prisma";

const memberInclude = {
  user: { select: { id: true, email: true, name: true, status: true } }
} satisfies Prisma.TenantMembershipInclude;

const inviteInclude = {
  tenant: { select: { id: true, status: true } }
} satisfies Prisma.TenantInviteInclude;

export function createPrismaTenantAdminRepository(): TenantAdminRepository {
  return {
    async listTenantOptions(userId) {
      return prisma.tenantMembership.findMany({
        where: { userId, status: "ACTIVE", tenant: { status: "ACTIVE" } },
        include: { tenant: { select: { id: true, name: true, legalName: true, status: true } } },
        orderBy: [{ tenant: { name: "asc" } }, { createdAt: "asc" }]
      });
    },

    async findActiveMembership(input) {
      return prisma.tenantMembership.findFirst({
        where: { userId: input.userId, tenantId: input.tenantId, status: "ACTIVE", tenant: { status: "ACTIVE" } },
        include: { tenant: { select: { id: true, name: true, legalName: true, status: true } } }
      });
    },

    async listMembers(tenantId) {
      return prisma.tenantMembership.findMany({
        where: { tenantId },
        include: memberInclude,
        orderBy: [{ role: "asc" }, { createdAt: "asc" }]
      });
    },

    async findMember(input) {
      return prisma.tenantMembership.findFirst({
        where: { id: input.membershipId, tenantId: input.tenantId },
        include: memberInclude
      });
    },

    async countActiveOwners(tenantId) {
      return prisma.tenantMembership.count({ where: { tenantId, role: "OWNER", status: "ACTIVE" } });
    },

    async suspendMember(input) {
      return prisma.tenantMembership.update({
        where: { id: input.membershipId, tenantId: input.tenantId },
        data: { status: "SUSPENDED" },
        include: memberInclude
      });
    },

    async listInvites(tenantId) {
      return prisma.tenantInvite.findMany({
        where: { tenantId },
        include: inviteInclude,
        orderBy: [{ createdAt: "desc" }]
      });
    },

    async findInviteById(input) {
      return prisma.tenantInvite.findFirst({
        where: { id: input.inviteId, tenantId: input.tenantId },
        include: inviteInclude
      });
    },

    async findInviteByTokenHash(tokenHash) {
      return prisma.tenantInvite.findUnique({ where: { tokenHash }, include: inviteInclude });
    },

    async findInviteByEmail(input) {
      return prisma.tenantInvite.findFirst({
        where: { tenantId: input.tenantId, email: input.email, status: input.status },
        include: inviteInclude,
        orderBy: { createdAt: "desc" }
      });
    },

    async createInvite(input) {
      return prisma.tenantInvite.create({
        data: {
          tenantId: input.tenantId,
          email: input.email,
          role: input.role,
          tokenHash: input.tokenHash,
          invitedBy: input.invitedBy,
          expiresAt: input.expiresAt
        },
        include: inviteInclude
      });
    },

    async updateInviteToken(input) {
      return prisma.tenantInvite.update({
        where: { id: input.inviteId, tenantId: input.tenantId },
        data: { tokenHash: input.tokenHash, expiresAt: input.expiresAt, status: "PENDING", acceptedBy: null, acceptedAt: null, revokedAt: null },
        include: inviteInclude
      });
    },

    async revokeInvite(input) {
      return prisma.tenantInvite.update({
        where: { id: input.inviteId, tenantId: input.tenantId },
        data: { status: "REVOKED", revokedAt: input.revokedAt },
        include: inviteInclude
      });
    },

    async expireInvite(input) {
      return prisma.tenantInvite.update({
        where: { id: input.inviteId, tenantId: input.tenantId },
        data: { status: "EXPIRED" },
        include: inviteInclude
      });
    },

    async findMembershipByUserTenant(input) {
      return prisma.tenantMembership.findUnique({
        where: { tenantId_userId: { tenantId: input.tenantId, userId: input.userId } },
        include: memberInclude
      });
    },

    async acceptInvite(input) {
      return prisma.$transaction(async (tx) => {
        await tx.profile.upsert({
          where: { id: input.user.id },
          update: { email: input.user.email, name: input.user.name, status: "ACTIVE" },
          create: { id: input.user.id, email: input.user.email, name: input.user.name, status: "ACTIVE" }
        });

        const member = await tx.tenantMembership.upsert({
          where: { tenantId_userId: { tenantId: input.invite.tenantId, userId: input.user.id } },
          update: { role: input.invite.role, status: "ACTIVE" },
          create: { tenantId: input.invite.tenantId, userId: input.user.id, role: input.invite.role, status: "ACTIVE" },
          include: memberInclude
        });

        const invite = await tx.tenantInvite.update({
          where: { id: input.invite.id, tenantId: input.invite.tenantId },
          data: { status: "ACCEPTED", acceptedBy: input.user.id, acceptedAt: input.acceptedAt },
          include: inviteInclude
        });

        return { invite, member };
      });
    }
  };
}
