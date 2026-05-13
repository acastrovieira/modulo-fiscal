import { assertPermission } from "@/shared/security/assert-permission";
import type { Role } from "@/shared/security/roles";

export type OperationalDashboardCounts = {
  importsPending: number;
  candidatesPendingReview: number;
  inconsistenciesOpen: number;
  blockingInconsistenciesOpen: number;
  batchesInReview: number;
  simulatedBatches: number;
  approvedForFutureIssuanceThisWeek: number;
  importErrors: number;
};

export type OperationalDashboardRepository = {
  getCounts(tenantId: string, now: Date): Promise<OperationalDashboardCounts>;
};

export type OperationalDashboardContext = {
  tenantId: string;
  actorId: string;
  actorRole: Role;
};

function severityForCount(count: number, warningThreshold = 1, criticalThreshold = 5) {
  if (count >= criticalThreshold) {
    return "critical" as const;
  }

  if (count >= warningThreshold) {
    return "attention" as const;
  }

  return "success" as const;
}

export async function getOperationalDashboardSummary(input: {
  context: OperationalDashboardContext;
  repository: OperationalDashboardRepository;
  now?: Date;
}) {
  assertPermission(
    { tenantId: input.context.tenantId, userId: input.context.actorId, role: input.context.actorRole },
    "imports.view"
  );

  const now = input.now ?? new Date();
  const counts = await input.repository.getCounts(input.context.tenantId, now);

  return {
    tenantId: input.context.tenantId,
    generatedAt: now.toISOString(),
    metrics: [
      {
        label: "Importacoes pendentes",
        value: counts.importsPending,
        severity: severityForCount(counts.importsPending, 1, 10),
        helperText: `${counts.importErrors} com erro estrutural`,
        actionLabel: "Ver fila"
      },
      {
        label: "Candidatos fiscais",
        value: counts.candidatesPendingReview,
        severity: severityForCount(counts.candidatesPendingReview, 1, 25),
        helperText: "Aguardando revisao humana",
        actionLabel: "Revisar"
      },
      {
        label: "Inconsistencias abertas",
        value: counts.inconsistenciesOpen,
        severity: severityForCount(counts.blockingInconsistenciesOpen, 1, 3),
        helperText: `${counts.blockingInconsistenciesOpen} bloqueantes`,
        actionLabel: "Tratar"
      },
      {
        label: "Lotes em revisao",
        value: counts.batchesInReview,
        severity: severityForCount(counts.batchesInReview, 1, 8),
        helperText: `${counts.simulatedBatches} simulados aguardando decisao`,
        actionLabel: "Abrir lotes"
      },
      {
        label: "Emissoes da semana",
        value: 0,
        severity: "neutral" as const,
        helperText: "NFS-e real desativada nesta fase",
        actionLabel: "Indisponivel"
      },
      {
        label: "Alertas criticos",
        value: counts.blockingInconsistenciesOpen + counts.importErrors,
        severity: severityForCount(counts.blockingInconsistenciesOpen + counts.importErrors, 1, 3),
        helperText: "Exigem acao supervisionada",
        actionLabel: "Priorizar"
      }
    ],
    queue: [
      {
        id: "imports-pending",
        label: "Importacoes aguardando validacao",
        module: "imports" as const,
        status: "PENDING_VALIDATION",
        severity: severityForCount(counts.importsPending, 1, 10),
        ageLabel: "fila atual",
        actionLabel: "Ver importacoes"
      },
      {
        id: "candidates-review",
        label: "Candidatos aguardando revisao fiscal",
        module: "candidates" as const,
        status: "NEEDS_REVIEW",
        severity: severityForCount(counts.candidatesPendingReview, 1, 25),
        ageLabel: "revisao humana",
        actionLabel: "Revisar candidatos"
      },
      {
        id: "inconsistencies-open",
        label: "Inconsistencias abertas ou em analise",
        module: "inconsistencies" as const,
        status: "OPEN",
        severity: severityForCount(counts.blockingInconsistenciesOpen, 1, 3),
        ageLabel: "bloqueio fiscal",
        actionLabel: "Tratar inconsistencias"
      },
      {
        id: "batches-review",
        label: "Lotes em revisao ou simulados",
        module: "batches" as const,
        status: "IN_REVIEW",
        severity: severityForCount(counts.batchesInReview + counts.simulatedBatches, 1, 8),
        ageLabel: "sem emissao real",
        actionLabel: "Abrir revisao"
      }
    ],
    alerts: [
      {
        id: "nfse-disabled",
        title: "Emissao NFS-e real desativada",
        severity: "neutral" as const,
        message: "Aprovacao de lote significa somente aprovacao futura supervisionada.",
        ageLabel: "guardrail ativo",
        actionLabel: "Manter bloqueio"
      },
      {
        id: "blocking-inconsistencies",
        title: "Inconsistencias bloqueantes",
        severity: severityForCount(counts.blockingInconsistenciesOpen, 1, 3),
        message: `${counts.blockingInconsistenciesOpen} registros impedem lote ou aprovacao operacional.`,
        ageLabel: "agora",
        actionLabel: "Resolver"
      }
    ],
    guardrails: [
      "Nenhum provider NFS-e e chamado pelo cockpit.",
      "Metricas sao filtradas pelo tenant atual no backend.",
      "Acoes criticas continuam protegidas por RBAC e auditoria."
    ]
  };
}
