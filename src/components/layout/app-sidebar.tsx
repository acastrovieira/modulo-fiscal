import { Activity, Archive, Building2, ClipboardCheck, FileInput, Gauge, Landmark, ShieldCheck } from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: Gauge },
  { label: "Importações", icon: FileInput },
  { label: "Fiscal", icon: ClipboardCheck },
  { label: "Documentos", icon: Archive },
  { label: "Tenant", icon: Building2 },
  { label: "Auditoria", icon: ShieldCheck },
  { label: "Operacional", icon: Activity },
  { label: "Financeiro", icon: Landmark }
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
            href={item.label === "Dashboard" ? "/dashboard" : "#"}
            key={item.label}
            className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </a>
        ))}
      </nav>
      <div className="border-t px-6 py-4 text-xs leading-5 text-muted-foreground">
        Emissão supervisionada, audit-first e idempotency-first desde a fundação.
      </div>
    </aside>
  );
}
