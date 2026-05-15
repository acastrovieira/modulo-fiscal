import { InvalidStateError } from "@/shared/errors/application-error";
import type { TenantBootstrapRepository } from "@/modules/tenant/application/tenant-bootstrap-types";
import { prisma } from "@/shared/database/prisma";

const membershipInclude = {
  user: { select: { id: true, email: true, name: true, status: true } }
};

export function createPrismaTenantBootstrapRepository(): TenantBootstrapRepository {
  return {
    async findProfileById(userId) {
      return prisma.profile.findUnique({ where: { id: userId } });
    },

    async hasActiveMembership(userId) {
      const count = await prisma.tenantMembership.count({ where: { userId, status: "ACTIVE", tenant: { status: "ACTIVE" } } });
      return count > 0;
    },

    async findTenantByCnpj(cnpj) {
      return prisma.tenant.findUnique({ where: { cnpj } });
    },

    async bootstrapTenant(input) {
      return prisma.$transaction(async (tx) => {
        const replay = await tx.tenantBootstrapRequest.findUnique({
          where: { userId_idempotencyKey: { userId: input.user.id, idempotencyKey: input.idempotencyKey } },
          include: { tenant: true }
        });

        if (replay) {
          const membership = await tx.tenantMembership.findUnique({
            where: { tenantId_userId: { tenantId: replay.tenantId, userId: input.user.id } }
          });

          if (!membership) {
            throw new InvalidStateError("Bootstrap replay membership is missing.");
          }

          return { tenant: replay.tenant, membership, replayed: true };
        }

        await tx.profile.upsert({
          where: { id: input.user.id },
          update: { email: input.user.email, name: input.user.name, status: "ACTIVE" },
          create: { id: input.user.id, email: input.user.email, name: input.user.name, status: "ACTIVE" }
        });

        const existingMembership = await tx.tenantMembership.findFirst({
          where: { userId: input.user.id, status: "ACTIVE", tenant: { status: "ACTIVE" } }
        });
        if (existingMembership) {
          throw new InvalidStateError("User already has an active tenant membership.");
        }

        const tenant = await tx.tenant.create({
          data: {
            name: input.name,
            legalName: input.legalName,
            cnpj: input.cnpj,
            status: "ACTIVE"
          }
        });

        const membership = await tx.tenantMembership.create({
          data: {
            tenantId: tenant.id,
            userId: input.user.id,
            role: "OWNER",
            status: "ACTIVE"
          },
          include: membershipInclude
        });

        await tx.tenantBootstrapRequest.create({
          data: {
            userId: input.user.id,
            tenantId: tenant.id,
            idempotencyKey: input.idempotencyKey
          }
        });

        return { tenant, membership, replayed: false };
      });
    }
  };
}
