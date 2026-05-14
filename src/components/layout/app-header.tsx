import { Bell, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAppEnvironment } from "@/config/app-env";
import type { CurrentTenant } from "@/shared/auth/current-tenant";

export function AppHeader({ tenant }: Readonly<{ tenant: CurrentTenant }>) {
  const environment = getAppEnvironment();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{tenant.name}</p>
          <Badge variant="outline" className="bg-muted">
            {environment}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">{tenant.legalName}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Pesquisar">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notificacoes">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="hidden items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium text-muted-foreground sm:flex">
          <ShieldCheck className="h-4 w-4 text-primary" />
          {tenant.role}
        </div>
      </div>
    </header>
  );
}
