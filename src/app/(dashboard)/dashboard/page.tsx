import { AlertTriangle, ArrowUpRight, CheckCircle2, FileStack, ListChecks, Radar, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status/status-badge";
import { getOperationalDashboardMetrics } from "@/modules/operational/application/dashboard-metrics";

const icons = [FileStack, ReceiptText, AlertTriangle, ListChecks, CheckCircle2, Radar];

export default async function DashboardPage() {
  const metrics = await getOperationalDashboardMetrics();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-3 border-b pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Cockpit fiscal supervisionado</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground">Operação fiscal da clínica</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Visão placeholder para importações, candidatos fiscais, inconsistências, lotes e auditoria operacional.
          </p>
        </div>
        <StatusBadge tone="neutral">NFS-e real desativada</StatusBadge>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = icons[index] ?? ArrowUpRight;

          return (
            <Card key={metric.label} className="rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-4">
                  <span className="text-3xl font-semibold">{metric.value}</span>
                  <StatusBadge tone={metric.severity}>{metric.severity}</StatusBadge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Fila operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {["Importação em validação", "Candidatos aguardando revisão", "Lote pendente de aprovação humana"].map(
              (item, index) => (
                <div key={item} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{item}</p>
                    <p className="text-xs text-muted-foreground">Etapa {index + 1} do workflow supervisionado</p>
                  </div>
                  <StatusBadge tone={index === 0 ? "attention" : "neutral"}>em revisão</StatusBadge>
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Controles críticos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>RBAC ativo por tenant, auditoria obrigatória e correlação preparada para rastrear ações críticas.</p>
            <p>Adaptadores NFS-e, parsers versionados e filas ficam reservados para etapas posteriores.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
