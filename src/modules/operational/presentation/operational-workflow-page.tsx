"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowUpRight, CheckCircle2, ClipboardList, FileInput, Layers3, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";

type ResourceKind = "imports" | "candidates" | "inconsistencies" | "batches";
type ApiEnvelope = { data: Array<Record<string, unknown>>; requestId: string };
type ApiErrorEnvelope = { error: { code: string; message: string; requestId: string } };

type Column = { key: string; label: string; render?: (row: Record<string, unknown>) => React.ReactNode };
type Config = { title: string; eyebrow: string; helper: string; endpoint: string; icon: typeof FileInput; columns: Column[]; primaryAction: string; empty: string; guardrails: string[] };

function asText(value: unknown): string { return value === null || value === undefined || value === "" ? "-" : String(value); }
function asDate(value: unknown): string { if (!value) return "-"; return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(String(value))); }
function asMoney(value: unknown): string { if (!value) return "-"; const cents = Number(value); if (!Number.isFinite(cents)) return String(value); return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
function toneForStatus(value: unknown): "neutral" | "attention" | "critical" | "success" { const status = String(value ?? ""); if (["BLOCKED", "HAS_ERRORS", "OPEN", "CANCELLED"].includes(status)) return "critical"; if (["NEEDS_REVIEW", "READY_FOR_REVIEW", "IN_REVIEW", "SIMULATED", "DRAFT"].includes(status)) return "attention"; if (["READY_FOR_BATCH", "APPROVED_FOR_FUTURE_ISSUANCE", "RESOLVED", "WAIVED", "VALIDATED"].includes(status)) return "success"; return "neutral"; }
function statusCell(row: Record<string, unknown>) { return <StatusBadge tone={toneForStatus(row.status)}>{asText(row.status)}</StatusBadge>; }
function isApiError(value: unknown): value is ApiErrorEnvelope { return typeof value === "object" && value !== null && "error" in value; }

const configs: Record<ResourceKind, Config> = {
  imports: {
    title: "Importacoes operacionais",
    eyebrow: "Entrada estruturada",
    helper: "Acompanhe arquivos importados, validacao estrutural e encaminhamento para candidatos fiscais.",
    endpoint: "/api/imports",
    icon: FileInput,
    primaryAction: "Nova importacao",
    empty: "Nenhuma importacao encontrada para o tenant atual.",
    columns: [
      { key: "documentFileName", label: "Documento" },
      { key: "status", label: "Status", render: statusCell },
      { key: "totalRows", label: "Linhas" },
      { key: "validRows", label: "Validas" },
      { key: "invalidRows", label: "Invalidas" },
      { key: "candidatesCount", label: "Candidatos" },
      { key: "createdAt", label: "Criado", render: (row) => asDate(row.createdAt) }
    ],
    guardrails: ["Validacao estrutural, nao fiscal", "Escopo por clinica ativo", "Idempotency-Key suportado"]
  },
  candidates: {
    title: "Candidatos fiscais",
    eyebrow: "Revisao humana",
    helper: "Revise candidatos gerados de importacoes antes de qualquer lote supervisionado.",
    endpoint: "/api/candidates",
    icon: ClipboardList,
    primaryAction: "Revisar selecionado",
    empty: "Nenhum candidato fiscal encontrado.",
    columns: [
      { key: "customerName", label: "Tomador" },
      { key: "customerDocumentMasked", label: "Documento" },
      { key: "status", label: "Status", render: statusCell },
      { key: "grossAmountCents", label: "Valor", render: (row) => asMoney(row.grossAmountCents) },
      { key: "serviceDate", label: "Servico" },
      { key: "openInconsistenciesCount", label: "Pendencias" }
    ],
    guardrails: ["Documento sempre mascarado", "Fingerprint fiscal nao exposto", "Bloqueantes impedem lote"]
  },
  inconsistencies: {
    title: "Inconsistencias abertas",
    eyebrow: "Controle de risco fiscal",
    helper: "Resolva ou dispense inconsistencias com justificativa auditavel antes de liberar candidatos.",
    endpoint: "/api/inconsistencies",
    icon: AlertCircle,
    primaryAction: "Tratar pendencia",
    empty: "Nenhuma inconsistencia encontrada.",
    columns: [
      { key: "type", label: "Tipo" },
      { key: "severity", label: "Severidade", render: (row) => <StatusBadge tone={row.severity === "BLOCKING" ? "critical" : "attention"}>{asText(row.severity)}</StatusBadge> },
      { key: "status", label: "Status", render: statusCell },
      { key: "message", label: "Mensagem" },
      { key: "createdAt", label: "Criado", render: (row) => asDate(row.createdAt) }
    ],
    guardrails: ["Details sensiveis nao expostos", "Fechamento exige justificativa", "Bloqueantes exigem manager/admin"]
  },
  batches: {
    title: "Lotes supervisionados",
    eyebrow: "Simulacao interna",
    helper: "Controle lotes em revisao, simulacao interna e aprovacao futura sem emissao real.",
    endpoint: "/api/batches",
    icon: Layers3,
    primaryAction: "Simular lote",
    empty: "Nenhum lote fiscal encontrado.",
    columns: [
      { key: "batchNumber", label: "Lote" },
      { key: "status", label: "Status", render: statusCell },
      { key: "itemsCount", label: "Itens" },
      { key: "totalGrossAmountCents", label: "Total", render: (row) => asMoney(row.totalGrossAmountCents) },
      { key: "simulatedAt", label: "Simulado", render: (row) => asDate(row.simulatedAt) },
      { key: "approvedAt", label: "Aprovado", render: (row) => asDate(row.approvedAt) }
    ],
    guardrails: ["NFS-e real desativada", "Provider externo nao chamado", "Aprovacao e apenas futura"]
  }
};

export function OperationalWorkflowPage({ kind }: Readonly<{ kind: ResourceKind }>) {
  const config = configs[kind];
  const Icon = config.icon;
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(config.endpoint, { cache: "no-store" });
      const payload: ApiEnvelope | ApiErrorEnvelope = await response.json();
      if (!response.ok || isApiError(payload)) throw new Error(isApiError(payload) ? payload.error.message : "Falha ao carregar dados.");
      setRows(payload.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [config.endpoint]);

  useEffect(() => { void load(); }, [load]);
  const statusSummary = useMemo(() => rows.reduce<Record<string, number>>((acc, row) => { const key = asText(row.status); acc[key] = (acc[key] ?? 0) + 1; return acc; }, {}), [rows]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <section className="flex flex-col gap-3 border-b pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">{config.eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground">{config.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{config.helper}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="neutral">Workflow supervisionado</StatusBadge>
          <Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className="h-4 w-4" />Atualizar</Button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusSummary).length === 0 ? <StatusBadge tone="neutral">sem dados</StatusBadge> : Object.entries(statusSummary).map(([status, count]) => <StatusBadge key={status} tone={toneForStatus(status)}>{status}: {count}</StatusBadge>)}
        </div>
        <div className="flex gap-2 md:justify-end">
          <Button variant="ghost" disabled={loading || rows.length === 0}><Search className="h-4 w-4" />Filtrar</Button>
          <Button disabled={loading || rows.length === 0}><Icon className="h-4 w-4" />{config.primaryAction}</Button>
        </div>
      </section>

      {error ? <Card className="rounded-lg border-red-200 bg-red-50"><CardContent className="flex items-center justify-between gap-3 py-4 text-sm text-red-700"><span>{error}</span><Button variant="outline" onClick={() => void load()}>Tentar novamente</Button></CardContent></Card> : null}

      <Card className="rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" />Fila de trabalho</CardTitle>
          <span className="text-xs text-muted-foreground">{rows.length} registros</span>
        </CardHeader>
        <CardContent>
          {loading ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-10 rounded bg-muted" />)}</div> : null}
          {!loading && !error && rows.length === 0 ? <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">{config.empty}</div> : null}
          {!loading && rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b text-xs uppercase text-muted-foreground"><tr>{config.columns.map((column) => <th key={column.key} className="px-3 py-3 font-medium">{column.label}</th>)}<th className="px-3 py-3 text-right font-medium">Acao</th></tr></thead>
                <tbody>{rows.map((row, index) => <tr key={asText(row.id) || index} className="border-b last:border-0"><>{config.columns.map((column) => <td key={column.key} className="max-w-[260px] px-3 py-3 align-middle"><div className="truncate">{column.render ? column.render(row) : asText(row[column.key])}</div></td>)}</><td className="px-3 py-3 text-right"><Button variant="ghost"><ArrowUpRight className="h-4 w-4" />Abrir</Button></td></tr>)}</tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-3 md:grid-cols-3">
        {config.guardrails.map((guardrail) => <div key={guardrail} className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" />{guardrail}</div>)}
        <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Permissoes operacionais ativas</div>
      </section>
    </div>
  );
}