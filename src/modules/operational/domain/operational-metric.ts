export type OperationalMetric = {
  label: string;
  value: number;
  severity: "neutral" | "attention" | "critical" | "success";
};
