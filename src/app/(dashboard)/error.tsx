"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({ error, reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    console.error("Dashboard route error", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Nao foi possivel carregar o cockpit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            Confirme sua sessão, tenant ativo e permissões. Se o erro persistir, informe o código de suporte para a equipe técnica.
          </p>
          {error.digest ? <p>Codigo de suporte: {error.digest}</p> : null}
          <Button onClick={reset}>Tentar novamente</Button>
        </CardContent>
      </Card>
    </div>
  );
}
