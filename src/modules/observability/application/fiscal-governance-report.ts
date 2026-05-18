import { assertCommandPermission, type CommandContext } from "@/shared/application/command-context";

export type FiscalGovernanceAuditRecord = {
  eventType: string;
  afterPayload: unknown;
  metadata: unknown;
  createdAt: Date;
};

export type FiscalGovernanceRepository = {
  findFiscalSimulationAuditRecords(input: {
    tenantId: string;
    from: Date;
    to: Date;
    limit: number;
  }): Promise<FiscalGovernanceAuditRecord[]>;
};

export type FiscalGovernanceReport = {
  service: "vetfiscal-os";
  scope: "tenant";
  status: "ok" | "attention" | "blocked";
  generatedAt: string;
  period: {
    from: string;
    to: string;
    days: number;
  };
  checks: {
    nfseIssuance: "disabled";
    externalProviderCalls: "none_detected" | "detected";
    externalTransmission: "none_detected" | "detected";
    fiscalValue: "none_detected" | "detected";
    auditCoverage: "present" | "missing";
  };
  metrics: {
    totalFiscalSimulationEvents: number;
    scenarioEvaluations: number;
    simulatedDocumentsCreated: number;
    simulatedDocumentsValidated: number;
    simulatedDocumentsSimulatedIssued: number;
    simulatedDocumentsVoided: number;
    unsafeFlaggedEvents: number;
  };
  scenarioEvaluationStatuses: {
    passed: number;
    needsReview: number;
    blocked: number;
    unknown: number;
  };
  recentEvents: Array<{
    eventType: string;
    createdAt: string;
  }>;
};

const defaultWindowDays = 7;
const maxAuditRecords = 500;

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function isTrue(value: unknown): boolean {
  return value === true || value === "true";
}

function detectUnsafeFlags(record: FiscalGovernanceAuditRecord): boolean {
  const metadata = readObject(record.metadata);
  const afterPayload = readObject(record.afterPayload);

  return (
    isTrue(metadata.nfseIssued) ||
    isTrue(metadata.externalProviderCalled) ||
    isTrue(metadata.externalTransmission) ||
    isTrue(metadata.fiscalValue) ||
    isTrue(afterPayload.nfseIssued) ||
    isTrue(afterPayload.externalProviderCalled) ||
    isTrue(afterPayload.externalTransmission) ||
    isTrue(afterPayload.fiscalValue)
  );
}

function scenarioStatus(record: FiscalGovernanceAuditRecord): "passed" | "needsReview" | "blocked" | "unknown" | null {
  if (record.eventType !== "fiscal_simulation.scenarios_evaluated") return null;
  const status = String(readObject(record.afterPayload).status ?? "").toUpperCase();
  if (status === "PASSED") return "passed";
  if (status === "NEEDS_REVIEW") return "needsReview";
  if (status === "BLOCKED") return "blocked";
  return "unknown";
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export function createFiscalGovernanceReport(input: {
  records: FiscalGovernanceAuditRecord[];
  now?: Date;
  from?: Date;
  windowDays?: number;
}): FiscalGovernanceReport {
  const now = input.now ?? new Date();
  const days = input.windowDays ?? defaultWindowDays;
  const from = input.from ?? addDays(now, -days);
  const records = input.records;
  const unsafeFlaggedEvents = records.filter(detectUnsafeFlags).length;
  const scenarioStatuses = { passed: 0, needsReview: 0, blocked: 0, unknown: 0 };

  for (const record of records) {
    const status = scenarioStatus(record);
    if (status) scenarioStatuses[status] += 1;
  }

  const status: FiscalGovernanceReport["status"] =
    unsafeFlaggedEvents > 0 ? "blocked" : records.length === 0 ? "attention" : "ok";

  return {
    service: "vetfiscal-os",
    scope: "tenant",
    status,
    generatedAt: now.toISOString(),
    period: {
      from: from.toISOString(),
      to: now.toISOString(),
      days
    },
    checks: {
      nfseIssuance: "disabled",
      externalProviderCalls: records.some((record) => isTrue(readObject(record.metadata).externalProviderCalled) || isTrue(readObject(record.afterPayload).externalProviderCalled)) ? "detected" : "none_detected",
      externalTransmission: records.some((record) => isTrue(readObject(record.metadata).externalTransmission) || isTrue(readObject(record.afterPayload).externalTransmission)) ? "detected" : "none_detected",
      fiscalValue: records.some((record) => isTrue(readObject(record.metadata).fiscalValue) || isTrue(readObject(record.afterPayload).fiscalValue)) ? "detected" : "none_detected",
      auditCoverage: records.length > 0 ? "present" : "missing"
    },
    metrics: {
      totalFiscalSimulationEvents: records.length,
      scenarioEvaluations: records.filter((record) => record.eventType === "fiscal_simulation.scenarios_evaluated").length,
      simulatedDocumentsCreated: records.filter((record) => record.eventType === "fiscal_simulation.document_created").length,
      simulatedDocumentsValidated: records.filter((record) => record.eventType === "fiscal_simulation.document_validated").length,
      simulatedDocumentsSimulatedIssued: records.filter((record) => record.eventType === "fiscal_simulation.document_simulated_issued").length,
      simulatedDocumentsVoided: records.filter((record) => record.eventType === "fiscal_simulation.document_voided").length,
      unsafeFlaggedEvents
    },
    scenarioEvaluationStatuses: scenarioStatuses,
    recentEvents: records.slice(0, 10).map((record) => ({
      eventType: record.eventType,
      createdAt: record.createdAt.toISOString()
    }))
  };
}

export async function getFiscalGovernanceReport(input: {
  context: CommandContext;
  repository: FiscalGovernanceRepository;
  now?: Date;
  windowDays?: number;
}): Promise<FiscalGovernanceReport> {
  assertCommandPermission(input.context, "audit.view");
  const now = input.now ?? new Date();
  const windowDays = input.windowDays ?? defaultWindowDays;
  const from = addDays(now, -windowDays);
  const records = await input.repository.findFiscalSimulationAuditRecords({
    tenantId: input.context.tenantId,
    from,
    to: now,
    limit: maxAuditRecords
  });

  return createFiscalGovernanceReport({ records, now, from, windowDays });
}
