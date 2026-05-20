export type FiscalOperationsGovernanceStatus = "ok" | "attention" | "blocked";
export type FiscalOperationsTone = "neutral" | "attention" | "critical" | "success";

export type FiscalOperationsGovernanceSnapshot = {
  status: FiscalOperationsGovernanceStatus;
  period: {
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
};

export type FiscalOperationsPanel = {
  label: string;
  value: number | string;
  tone: FiscalOperationsTone;
  helperText: string;
};

export type FiscalOperationsViewModel = {
  headline: string;
  tone: FiscalOperationsTone;
  reviewQueueLabel: string;
  panels: FiscalOperationsPanel[];
  guardrails: string[];
};

function toneForGovernance(status: FiscalOperationsGovernanceStatus): FiscalOperationsTone {
  if (status === "blocked") return "critical";
  if (status === "attention") return "attention";
  return "success";
}

export function createFiscalOperationsViewModel(snapshot: FiscalOperationsGovernanceSnapshot): FiscalOperationsViewModel {
  const reviewCount = snapshot.scenarioEvaluationStatuses.needsReview + snapshot.scenarioEvaluationStatuses.blocked + snapshot.scenarioEvaluationStatuses.unknown;
  const unsafe = snapshot.metrics.unsafeFlaggedEvents;

  return {
    headline: snapshot.status === "ok"
      ? "Simulador fiscal governado"
      : snapshot.status === "attention"
        ? "Governanca aguardando trilha fiscal"
        : "Governanca fiscal bloqueada",
    tone: toneForGovernance(snapshot.status),
    reviewQueueLabel: reviewCount === 0 ? "Sem revisoes pendentes" : `${reviewCount} revisoes de cenario`,
    panels: [
      {
        label: "Eventos monitorados",
        value: snapshot.metrics.totalFiscalSimulationEvents,
        tone: snapshot.checks.auditCoverage === "present" ? "success" : "attention",
        helperText: `${snapshot.period.days} dias de trilha auditavel`
      },
      {
        label: "Cenarios avaliados",
        value: snapshot.metrics.scenarioEvaluations,
        tone: reviewCount > 0 ? "attention" : "success",
        helperText: `${snapshot.scenarioEvaluationStatuses.passed} passaram sem bloqueio`
      },
      {
        label: "Documentos simulados",
        value: snapshot.metrics.simulatedDocumentsCreated,
        tone: "neutral",
        helperText: `${snapshot.metrics.simulatedDocumentsSimulatedIssued} simulacoes internas concluidas`
      },
      {
        label: "Flags proibidas",
        value: unsafe,
        tone: unsafe > 0 ? "critical" : "success",
        helperText: "emissao real, provider, transmissao ou valor fiscal"
      }
    ],
    guardrails: [
      "Emissao fiscal real continua desativada.",
      "Cenarios sao simulados e sem transmissao externa.",
      "Governanca fiscal usa auditoria tenant-scoped.",
      "Dados sensiveis nao aparecem no cockpit."
    ]
  };
}
