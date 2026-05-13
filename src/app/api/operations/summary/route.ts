import { NextResponse } from "next/server";
import { getAppEnvironment } from "@/config/app-env";
import {
  getOperationalDashboardSummary,
  type OperationalDashboardRepository
} from "@/modules/operational/application/dashboard-metrics";
import { createPrismaOperationalDashboardRepository } from "@/modules/operational/infrastructure/prisma-dashboard-repository";
import { currentTenant } from "@/shared/auth/current-tenant";
import { currentUser } from "@/shared/auth/current-user";
import { apiErrorResponse } from "@/shared/http/api-error-response";
import { createCorrelationId } from "@/shared/logging/correlation-id";

export const dynamic = "force-dynamic";

const emptyOperationalRepository: OperationalDashboardRepository = {
  async getCounts() {
    return {
      importsPending: 0,
      candidatesPendingReview: 0,
      inconsistenciesOpen: 0,
      blockingInconsistenciesOpen: 0,
      batchesInReview: 0,
      simulatedBatches: 0,
      approvedForFutureIssuanceThisWeek: 0,
      importErrors: 0
    };
  }
};

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => reject(new Error("Operational summary timeout.")), timeoutMs);
    })
  ]);
}

export async function GET() {
  const requestId = createCorrelationId();

  try {
    const [user, tenant] = await Promise.all([currentUser(), currentTenant()]);
    const context = {
      tenantId: tenant.id,
      actorId: user.id,
      actorRole: tenant.role
    };

    try {
      const summary = await withTimeout(
        getOperationalDashboardSummary({ context, repository: createPrismaOperationalDashboardRepository() }),
        3000
      );
      return NextResponse.json({ data: summary, requestId });
    } catch (error) {
      if (getAppEnvironment() !== "Local") {
        throw error;
      }

      const summary = await getOperationalDashboardSummary({ context, repository: emptyOperationalRepository });
      return NextResponse.json({ data: summary, requestId, degraded: true });
    }
  } catch (error) {
    return apiErrorResponse(error, requestId);
  }
}
