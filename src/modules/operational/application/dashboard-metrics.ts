import type { OperationalMetric } from "@/modules/operational/domain/operational-metric";

export async function getOperationalDashboardMetrics(): Promise<OperationalMetric[]> {
  return [
    { label: "Importações pendentes", value: 12, severity: "attention" },
    { label: "Candidatos fiscais", value: 48, severity: "neutral" },
    { label: "Inconsistências abertas", value: 7, severity: "critical" },
    { label: "Lotes em revisão", value: 3, severity: "attention" },
    { label: "Emissões da semana", value: 126, severity: "success" },
    { label: "Alertas críticos", value: 2, severity: "critical" }
  ];
}
