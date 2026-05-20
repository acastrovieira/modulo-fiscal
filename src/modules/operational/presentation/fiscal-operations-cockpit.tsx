"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, FileClock, Gauge, RefreshCw, Route, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import {
  createFiscalOperationsViewModel,
  type FiscalOperationsGovernanceSnapshot,
  type FiscalOperationsTone
} from "@/modules/operational/application/fiscal-operations-view-model";

type GovernanceResponse = {
  data: FiscalOperationsGovernanceSnapshot & {
    generatedAt: string;
    recentEvents: Array<{ eventType: string; createdAt: string }>;
    disclaimer: string;
  };
  requestId: string;
};

type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
};

const panelIcons = [Activity, Route, FileClock, AlertTriangle];

function isApiError(value: unknown): value is ApiErrorResponse {
  return typeof value === "object" && value !== null && "error" in value;
}

function formatApiError(error: ApiErrorResponse["error"]): string {
  return `${error.message} (${error.code}). Codigo de suporte: ${error.requestId}.`;
}

function formatDateTime(value: string | null): string {
  if (!value) return "Aguardando dados";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function toneLabel(tone: FiscalOperationsTone): string {
  if (tone === "critical") return "bloqueado";
  if (tone === "attention") return "atencao";
  if (tone === "success") return "estavel";
  return "informativo";
}

function PanelSkeleton() {
  return (
    <Card className="rounded-lg">
      <CardHeader className="space-y-3 pb-2">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-14 rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

export function FiscalOperationsCockpit() {
  const [snapshot, setSnapshot] = useState<GovernanceResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGovernance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/observability/fiscal-governance?windowDays=7", { cache: "no-store" });
      const payload: GovernanceResponse | ApiErrorResponse = await response.json();

      if (!response.ok || isApiError(payload)) {
        throw new Error(isApiError(payload) ? formatApiError(payload.error) : "Falha ao carregar governanca fiscal.");
      }

      setSnapshot(payload.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha ao carregar governanca fiscal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGovernance();
  }, [loadGovernance]);

  const viewModel = useMemo(() => (snapshot ? createFiscalOperationsViewModel(snapshot) : null), [snapshot]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <section className="flex flex-col gap-3 border-b pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Simulador fiscal governado</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground">Cockpit fiscal operacional</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Visao supervisionada de documentos simulados, cenarios versionados e governanca fiscal do tenant ativo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={viewModel?.tone ?? "neutral"}>{viewModel ? toneLabel(viewModel.tone) : "carregando"}</StatusBadge>
          <span className="text-xs text-muted-foreground">Atualizado: {formatDateTime(snapshot?.generatedAt ?? null)}</span>
          <Button variant="outline" onClick={() => void loadGovernance()} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </section>

      {error ? (
        <Card className="rounded-lg border-red-200 bg-red-50">
          <CardContent className="flex flex-col gap-3 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <Button variant="outline" onClick={() => void loadGovernance()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {loading && !viewModel
          ? Array.from({ length: 4 }).map((_, index) => <PanelSkeleton key={index} />)
          : viewModel?.panels.map((panel, index) => {
              const Icon = panelIcons[index] ?? Gauge;

              return (
                <Card key={panel.label} className="rounded-lg">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{panel.label}</CardTitle>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{panel.helperText}</p>
                    </div>
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between gap-4">
                      <span className="text-3xl font-semibold">{panel.value}</span>
                      <StatusBadge tone={panel.tone}>{toneLabel(panel.tone)}</StatusBadge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Jornada supervisionada</CardTitle>
            <StatusBadge tone="neutral">sem emissao real</StatusBadge>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Perfil simulado", "Configuracao fiscal interna do tenant para validar consistencia operacional."],
              ["Tomador mascarado", "Cadastro com documento mascarado e hash interno, sem CPF/CNPJ publico."],
              ["Documento simulado", "Documento sem valor fiscal, sem transmissao externa e com identificador de simulacao."],
              ["Cenarios versionados", "Avaliacao governada por vetcare-simulation-baseline@2026.05."],
              ["Governanca", "Relatorio auditavel para bloquear qualquer flag proibida."]
            ].map(([title, helper], index) => (
              <div key={title} className="grid gap-3 border-b pb-3 last:border-0 last:pb-0 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-semibold">{index + 1}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs leading-5 text-muted-foreground">{helper}</p>
                </div>
                <StatusBadge tone="success">ativo</StatusBadge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Fila de governanca</CardTitle>
            <StatusBadge tone={viewModel?.tone ?? "neutral"}>{viewModel?.reviewQueueLabel ?? "carregando"}</StatusBadge>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot?.recentEvents.length ? snapshot.recentEvents.map((event) => (
              <div key={`${event.eventType}-${event.createdAt}`} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{event.eventType}</p>
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</p>
              </div>
            )) : (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Nenhum evento fiscal simulado encontrado na janela atual.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {(viewModel?.guardrails ?? [
          "Emissao fiscal real continua desativada.",
          "Cenarios sao simulados e sem transmissao externa.",
          "Governanca fiscal usa auditoria tenant-scoped.",
          "Dados sensiveis nao aparecem no cockpit."
        ]).map((guardrail) => (
          <div key={guardrail} className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs leading-5 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            {guardrail}
          </div>
        ))}
      </section>
    </div>
  );
}
