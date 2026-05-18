import { z } from "zod";
import type { FiscalGovernanceReport } from "@/modules/observability/application/fiscal-governance-report";

export const fiscalGovernanceQuerySchema = z.object({
  windowDays: z.coerce.number().int().min(1).max(30).optional()
}).strict();

export function toFiscalGovernanceReportDTO(report: FiscalGovernanceReport) {
  return {
    service: report.service,
    scope: report.scope,
    status: report.status,
    generatedAt: report.generatedAt,
    period: report.period,
    checks: report.checks,
    metrics: report.metrics,
    scenarioEvaluationStatuses: report.scenarioEvaluationStatuses,
    recentEvents: report.recentEvents,
    disclaimer: "OBSERVABILIDADE INTERNA - SEM VALOR FISCAL - NAO TRANSMITIDO A AMBIENTE OFICIAL"
  };
}
