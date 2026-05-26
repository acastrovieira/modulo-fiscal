import type { SessionRepository } from "@/shared/auth/session-types";
import { prisma } from "@/shared/database/prisma";

export function createPrismaSessionRepository(): SessionRepository {
  return {
    async findProfileById(userId) {
      return prisma.profile.findUnique({ where: { id: userId } });
    },

    async findProfileByEmail(email) {
      return prisma.profile.findUnique({ where: { email: email.toLowerCase() } });
    },

    async findActiveMembership(input) {
      return prisma.tenantMembership.findFirst({
        where: {
          userId: input.userId,
          tenantId: input.tenantId,
          status: "ACTIVE",
          tenant: { status: "ACTIVE" }
        },
        include: {
          tenant: { select: { id: true, name: true, legalName: true, status: true } }
        },
        orderBy: { createdAt: "asc" }
      });
    }
  };
}
