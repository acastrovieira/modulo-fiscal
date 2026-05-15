import type { Prisma } from "@prisma/client";
import type { TenantAdminRepository } from "@/modules/tenant/application/tenant-admin-types";
import { prisma } from "@/shared/database/prisma";

const memberInclude = {
  user: { select: { id: true, email: true, name: true, status: true } }
} satisfies Prisma.TenantMembershipInclude;

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

    async createInvite(input) {
      return prisma.tenantInvite.create({
        data: {
          tenantId: input.tenantId,
          email: input.email,
          role: input.role,
          tokenHash: input.tokenHash,
          invitedBy: input.invitedBy,
          expiresAt: input.expiresAt
        }
      });
    }
  };
}
