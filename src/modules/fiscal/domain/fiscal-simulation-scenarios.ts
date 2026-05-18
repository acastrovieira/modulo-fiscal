import type { FiscalServiceTaker, FiscalSimulationProfile, SimulatedFiscalDocument } from "@/modules/fiscal/domain/fiscal-simulation";

export const fiscalSimulationScenarioSet = {
  id: "vetcare-simulation-baseline",
  version: "2026.05",
  title: "VetFiscal simulation baseline",
  simulatedOnly: true,
  fiscalValue: false,
  externalTransmission: false
} as const;

export type FiscalSimulationScenarioSeverity = "INFO" | "WARNING" | "BLOCKING";
export type FiscalSimulationScenarioStatus = "PASSED" | "NEEDS_REVIEW" | "BLOCKED";

export type FiscalSimulationScenarioFinding = {
  scenarioId: string;
  scenarioVersion: string;
  code: string;
  severity: FiscalSimulationScenarioSeverity;
  status: FiscalSimulationScenarioStatus;
  message: string;
  recommendation: string;
  evidence: Record<string, string | number | boolean | null>;
};

export type FiscalSimulationScenarioEvaluation = {
  scenarioSetId: typeof fiscalSimulationScenarioSet.id;
  scenarioSetVersion: typeof fiscalSimulationScenarioSet.version;
  simulatedOnly: true;
  fiscalValue: false;
  externalTransmission: false;
  documentId: string;
  simulationId: string;
  status: "PASSED" | "NEEDS_REVIEW" | "BLOCKED";
  findings: FiscalSimulationScenarioFinding[];
};

export type FiscalSimulationScenarioContext = {
  profile: FiscalSimulationProfile;
  taker: FiscalServiceTaker;
  document: SimulatedFiscalDocument;
};

function statusFromFindings(findings: FiscalSimulationScenarioFinding[]): FiscalSimulationScenarioEvaluation["status"] {
  if (findings.some((finding) => finding.status === "BLOCKED")) return "BLOCKED";
  if (findings.some((finding) => finding.status === "NEEDS_REVIEW")) return "NEEDS_REVIEW";
  return "PASSED";
}

function finding(input: Omit<FiscalSimulationScenarioFinding, "scenarioVersion">): FiscalSimulationScenarioFinding {
  return {
    ...input,
    scenarioVersion: fiscalSimulationScenarioSet.version
  };
}

export function evaluateFiscalSimulationScenarios(context: FiscalSimulationScenarioContext): FiscalSimulationScenarioEvaluation {
  const { profile, taker, document } = context;
  const items = document.items ?? [];
  const findings: FiscalSimulationScenarioFinding[] = [];
  const mismatchedServiceCodes = items.filter((item) => item.serviceCode !== profile.serviceDefaultCode);

  if (!document.simulationId.startsWith("sim_") || document.fiscalValue || document.externalTransmission) {
    findings.push(finding({
      scenarioId: "simulation-only-guardrail",
      code: "SIMULATION_ONLY_VIOLATION",
      severity: "BLOCKING",
      status: "BLOCKED",
      message: "Documento fora das garantias de simulacao.",
      recommendation: "Interromper o fluxo e revisar flags internas antes de qualquer nova etapa.",
      evidence: {
        simulationIdPrefix: document.simulationId.slice(0, 4),
        fiscalValue: document.fiscalValue,
        externalTransmission: document.externalTransmission
      }
    }));
  }

  if (items.length === 0) {
    findings.push(finding({
      scenarioId: "document-items-required",
      code: "NO_ITEMS",
      severity: "BLOCKING",
      status: "BLOCKED",
      message: "Documento simulado sem itens de servico.",
      recommendation: "Adicionar ao menos um item antes de seguir para validacao operacional.",
      evidence: { itemCount: 0 }
    }));
  }

  if (taker.documentType === "UNKNOWN") {
    findings.push(finding({
      scenarioId: "taker-document-classification",
      code: "UNKNOWN_TAKER_DOCUMENT",
      severity: "WARNING",
      status: "NEEDS_REVIEW",
      message: "Documento do tomador nao foi classificado como CPF ou CNPJ.",
      recommendation: "Revisar cadastro mascarado do tomador antes de simular etapas posteriores.",
      evidence: {
        documentMasked: taker.documentMasked,
        documentType: taker.documentType
      }
    }));
  }

  if (mismatchedServiceCodes.length > 0) {
    findings.push(finding({
      scenarioId: "default-service-code-alignment",
      code: "SERVICE_CODE_OUTSIDE_PROFILE_DEFAULT",
      severity: "WARNING",
      status: "NEEDS_REVIEW",
      message: "Ha itens com codigo de servico diferente do padrao configurado no perfil.",
      recommendation: "Confirmar se a divergencia e esperada para a operacao simulada.",
      evidence: {
        defaultServiceCode: profile.serviceDefaultCode,
        mismatchedItems: mismatchedServiceCodes.length
      }
    }));
  }

  if (document.totalAmountCents >= 100000n) {
    findings.push(finding({
      scenarioId: "high-value-review",
      code: "HIGH_VALUE_SIMULATION_REVIEW",
      severity: "WARNING",
      status: "NEEDS_REVIEW",
      message: "Valor simulado acima do limite operacional de revisao.",
      recommendation: "Solicitar revisao humana antes de aprovar qualquer continuidade futura.",
      evidence: {
        totalAmountCents: document.totalAmountCents.toString(),
        reviewThresholdCents: "100000"
      }
    }));
  }

  if (findings.length === 0) {
    findings.push(finding({
      scenarioId: "baseline-ready-for-review",
      code: "BASELINE_SCENARIOS_PASSED",
      severity: "INFO",
      status: "PASSED",
      message: "Cenarios simulados basicos passaram sem bloqueios.",
      recommendation: "Manter revisao humana antes de qualquer decisao operacional futura.",
      evidence: {
        itemCount: items.length,
        totalAmountCents: document.totalAmountCents.toString(),
        documentStatus: document.status
      }
    }));
  }

  return {
    scenarioSetId: fiscalSimulationScenarioSet.id,
    scenarioSetVersion: fiscalSimulationScenarioSet.version,
    simulatedOnly: true,
    fiscalValue: false,
    externalTransmission: false,
    documentId: document.id,
    simulationId: document.simulationId,
    status: statusFromFindings(findings),
    findings
  };
}
