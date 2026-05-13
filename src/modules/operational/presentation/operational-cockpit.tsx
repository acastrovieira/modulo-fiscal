"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowUpRight, CheckCircle2, FileStack, ListChecks, RefreshCw, ReceiptText, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import type { OperationalDashboardSummary } from "@/modules/operational/domain/operational-metric";

type SummaryResponse = {
  data: OperationalDashboardSummary;
  requestId: string;
};

type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
};

const icons = [FileStack, ReceiptText, AlertTriangle, ListChecks, CheckCircle2, Radar];

function isApiError(value: unknown): value is ApiErrorResponse {
  return typeof value === "object" && value !== null && "error" in value;
}

function formatUpdatedAt(value: string | null): string {
  if (!value) {
    return "Aguardando dados";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(value));
}

function MetricSkeleton() {
  return (
    <Card className="rounded-lg">
      <CardHeader className="space-y-3 pb-2">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-9 w-16 rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

export function OperationalCockpit() {
  const [summary, setSummary] = useState<OperationalDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/operations/summary", { cache: "no-store" });
      const payload: SummaryResponse | ApiErrorResponse = await response.json();

      if (!response.ok || isApiError(payload)) {
        throw new Error(isApiError(payload) ? payload.error.message : "Falha ao carregar cockpit operacional.");
      }

      setSummary(payload.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha ao carregar cockpit operacional.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const hasQueue = useMemo(() => (summary?.queue.some((item) => item.severity !== "success") ?? false), [summary]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <section className="flex flex-col gap-3 border-b pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Cockpit fiscal supervisionado</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground">Operacao fiscal da clinica</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Triagem operacional por tenant para importacoes, candidatos, inconsistencias e lotes simulados.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="neutral">NFS-e real desativada</StatusBadge>
          <span className="text-xs text-muted-foreground">Atualizado: {formatUpdatedAt(summary?.generatedAt ?? null)}</span>
          <Button variant="outline" onClick={() => void loadSummary()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </section>

      {error ? (
        <Card className="rounded-lg border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-sm text-red-800">Falha ao carregar dados operacionais</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>
            <Button variant="outline" onClick={() => void loadSummary()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {loading && !summary
          ? Array.from({ length: 6 }).map((_, index) => <MetricSkeleton key={index} />)
          : summary?.metrics.map((metric, index) => {
              const Icon = icons[index] ?? ArrowUpRight;

              return (
                <Card key={metric.label} className="rounded-lg">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">{metric.helperText}</p>
                    </div>
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between gap-4">
                      <span className="text-3xl font-semibold">{metric.value}</span>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge tone={metric.severity}>{metric.severity}</StatusBadge>
                        <span className="text-xs font-medium text-primary">{metric.actionLabel}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </section>

      {!loading && summary && summary.metrics.every((metric) => metric.value === 0) ? (
        <Card className="rounded-lg">
          <CardContent className="py-5 text-sm text-muted-foreground">
            Nenhuma pendencia operacional encontrada para o tenant atual.
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Fila operacional</CardTitle>
            <StatusBadge tone={hasQueue ? "attention" : "success"}>{hasQueue ? "em revisao" : "estavel"}</StatusBadge>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary?.queue.map((item) => (
              <div key={item.id} className="grid gap-3 border-b pb-3 last:border-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.module} / {item.status} / {item.ageLabel}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <StatusBadge tone={item.severity}>{item.severity}</StatusBadge>
                  <Button variant="ghost">
                    {item.actionLabel}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Alertas criticos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary?.alerts.map((alert) => (
              <div key={alert.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <StatusBadge tone={alert.severity}>{alert.severity}</StatusBadge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{alert.message}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{alert.ageLabel}</span>
                  <span className="font-medium text-primary">{alert.actionLabel}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {summary?.guardrails.map((guardrail) => (
          <div key={guardrail} className="rounded-md border bg-white px-3 py-2 text-xs leading-5 text-muted-foreground">
            {guardrail}
          </div>
        ))}
      </section>
    </div>
  );
}


