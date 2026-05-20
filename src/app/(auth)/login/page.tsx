"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type ApiErrorPayload = { error?: { code?: string; message?: string; requestId?: string } };

function formatLoginError(payload: ApiErrorPayload, fallback: string): string {
  const code = payload.error?.code ? ` (${payload.error.code})` : "";
  const requestId = payload.error?.requestId ? ` Codigo de suporte: ${payload.error.requestId}.` : "";
  return `${payload.error?.message ?? fallback}${code}.${requestId}`;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Sessao server-side com Supabase Auth preparada.");
  const [submitting, setSubmitting] = useState(false);

  async function signIn() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setStatus("Validando credenciais...");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const payload = await response.json() as ApiErrorPayload;

      if (!response.ok) {
        setStatus(formatLoginError(payload, "Nao foi possivel entrar"));
        return;
      }

      setStatus("Credenciais validadas. Verificando tenant ativo...");
      const statusResponse = await fetch("/api/onboarding/status");
      const statusPayload = await statusResponse.json() as ApiErrorPayload & { data?: { nextPath?: string } };

      if (!statusResponse.ok) {
        setStatus(formatLoginError(statusPayload, "Nao foi possivel resolver o tenant"));
        return;
      }

      window.location.href = statusPayload.data?.nextPath ?? "/dashboard";
    } catch {
      setStatus("Falha de rede durante o login. Tente novamente ou acione o suporte com o horario do erro.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">VetFiscal OS</h1>
            <p className="text-sm text-muted-foreground">Acesso operacional</p>
          </div>
        </div>
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); signIn(); }}>
          <input className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring" type="email" placeholder="email@clinica.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input className="h-10 w-full rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring" type="password" placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button className="w-full" type="submit" disabled={submitting}>{submitting ? "Entrando..." : "Entrar"}</Button>
        </form>
        <p className="mt-4 rounded-md border bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
          Ambiente beta supervisionado: acesso permitido apenas para usuarios aprovados e tenants ativos.
        </p>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">{status}</p>
      </section>
    </main>
  );
}
