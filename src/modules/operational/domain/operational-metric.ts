export type OperationalSeverity = "neutral" | "attention" | "critical" | "success";

export type OperationalMetric = {
  label: string;
  value: number;
  severity: OperationalSeverity;
  helperText?: string;
  actionLabel?: string;
};

export type OperationalQueueItem = {
  id: string;
  label: string;
  module: "imports" | "candidates" | "inconsistencies" | "batches";
  status: string;
  severity: OperationalSeverity;
  ageLabel: string;
  actionLabel: string;
};

export type OperationalAlert = {
  id: string;
  title: string;
  severity: OperationalSeverity;
  message: string;
  ageLabel: string;
  actionLabel: string;
};

export type OperationalDashboardSummary = {
  tenantId: string;
  generatedAt: string;
  metrics: OperationalMetric[];
  queue: OperationalQueueItem[];
  alerts: OperationalAlert[];
  guardrails: string[];
};
