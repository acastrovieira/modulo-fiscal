import { Activity, Archive, Building2, ClipboardCheck, FileInput, Gauge, Layers3, Landmark, ShieldCheck, TriangleAlert } from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Importacoes", href: "/dashboard/imports", icon: FileInput },
  { label: "Candidatos", href: "/dashboard/candidates", icon: ClipboardCheck },
  { label: "Inconsistencias", href: "/dashboard/inconsistencies", icon: TriangleAlert },
  { label: "Lotes", href: "/dashboard/batches", icon: Layers3 },
  { label: "Documentos", href: "#", icon: Archive },
  { label: "Tenant", href: "#", icon: Building2 },
  { label: "Auditoria", href: "#", icon: ShieldCheck },
  { label: "Operacional", href: "#", icon: Activity },
  { label: "Financeiro", href: "#", icon: Landmark }
];

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">VetFiscal OS</p>
          <p className="text-xs text-muted-foreground">Fiscal operations</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <a
            href={item.href}
            key={item.label}
            className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </a>
        ))}
      </nav>
      <div className="border-t px-6 py-4 text-xs leading-5 text-muted-foreground">
        Emissao supervisionada, audit-first e idempotency-first desde a fundacao.
      </div>
    </aside>
  );
}