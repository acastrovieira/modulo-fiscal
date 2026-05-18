import type {
  FiscalGovernanceAuditRecord,
  FiscalGovernanceRepository
} from "@/modules/observability/application/fiscal-governance-report";
import { prisma } from "@/shared/database/prisma";

export function createPrismaFiscalGovernanceRepository(): FiscalGovernanceRepository {
  return {
    async findFiscalSimulationAuditRecords(input): Promise<FiscalGovernanceAuditRecord[]> {
      return prisma.auditEvent.findMany({
        where: {
          tenantId: input.tenantId,
          eventType: { startsWith: "fiscal_simulation." },
          createdAt: {
            gte: input.from,
            lte: input.to
          }
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        select: {
          eventType: true,
          afterPayload: true,
          metadata: true,
          createdAt: true
        }
      });
    }
  };
}
