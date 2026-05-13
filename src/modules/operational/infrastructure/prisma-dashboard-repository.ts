import type { PrismaClient } from "@prisma/client";
import type { OperationalDashboardRepository } from "@/modules/operational/application/dashboard-metrics";

type DashboardDatabase = Pick<
  PrismaClient,
  "importBatch" | "fiscalCandidate" | "fiscalInconsistency" | "fiscalBatch"
>;

async function getDefaultDatabase(): Promise<DashboardDatabase> {
  const { prisma } = await import("@/shared/database/prisma");
  return prisma;
}

function startOfWeek(date: Date): Date {
  const value = new Date(date);
  const day = value.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  value.setUTCDate(value.getUTCDate() - diff);
  value.setUTCHours(0, 0, 0, 0);
  return value;
}

export function createPrismaOperationalDashboardRepository(db?: DashboardDatabase): OperationalDashboardRepository {
  return {
    async getCounts(tenantId, now) {
      const repository = db ?? (await getDefaultDatabase());
      const weekStart = startOfWeek(now);
      const [
        importsPending,
        importErrors,
        candidatesPendingReview,
        inconsistenciesOpen,
        blockingInconsistenciesOpen,
        batchesInReview,
        simulatedBatches,
        approvedForFutureIssuanceThisWeek
      ] = await Promise.all([
        repository.importBatch.count({ where: { tenantId, status: { in: ["PENDING_VALIDATION", "VALIDATING", "READY_FOR_REVIEW"] } } }),
        repository.importBatch.count({ where: { tenantId, status: "HAS_ERRORS" } }),
        repository.fiscalCandidate.count({ where: { tenantId, status: { in: ["NEEDS_REVIEW", "BLOCKED", "READY_FOR_BATCH"] } } }),
        repository.fiscalInconsistency.count({ where: { tenantId, status: { in: ["OPEN", "IN_REVIEW"] } } }),
        repository.fiscalInconsistency.count({ where: { tenantId, status: { in: ["OPEN", "IN_REVIEW"] }, severity: "BLOCKING" } }),
        repository.fiscalBatch.count({ where: { tenantId, status: "IN_REVIEW" } }),
        repository.fiscalBatch.count({ where: { tenantId, status: "SIMULATED" } }),
        repository.fiscalBatch.count({
          where: { tenantId, status: "APPROVED_FOR_FUTURE_ISSUANCE", approvedAt: { gte: weekStart, lte: now } }
        })
      ]);

      return {
        importsPending,
        candidatesPendingReview,
        inconsistenciesOpen,
        blockingInconsistenciesOpen,
        batchesInReview,
        simulatedBatches,
        approvedForFutureIssuanceThisWeek,
        importErrors
      };
    }
  };
}
