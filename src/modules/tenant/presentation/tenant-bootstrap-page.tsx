"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ApiErrorPayload = { error?: { code?: string; message?: string; requestId?: string } };

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const payload = await response.json() as ApiErrorPayload & { data?: T };
  if (!response.ok) {
    const code = payload.error?.code ? ` (${payload.error.code})` : "";
    const requestId = payload.error?.requestId ? ` Codigo de suporte: ${payload.error.requestId}.` : "";
    throw new Error(`${payload.error?.message ?? "Request failed"}${code}.${requestId}`);
  }
  return payload.data as T;
}

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now()}${Math.random().toString(36).slice(2)}`.slice(0, 32);
}

export function TenantBootstrapPage() {
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [status, setStatus] = useState("Verificando onboarding...");
  const [submitting, setSubmitting] = useState(false);
  const idempotencyKey = useMemo(createIdempotencyKey, []);

  useEffect(() => {
    fetchJson<{ status: string; nextPath: string }>("/api/onboarding/status")
      .then((data) => {
        if (data.nextPath === "/dashboard") {
          window.location.href = data.nextPath;
          return;
        }
        setStatus("Pronto para criar o primeiro tenant.");
      })
      .catch((error: Error) => setStatus(error.message));
  }, []);

  async function submit() {
    setSubmitting(true);
    setStatus("Criando tenant e membership OWNER...");
    try {
      const data = await fetchJson<{ nextPath: string }>("/api/onboarding/tenant", {
        method: "POST",
        body: JSON.stringify({ name, legalName: legalName || null, cnpj: cnpj || null, idempotencyKey })
      });
      window.location.href = data.nextPath;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Nao foi possivel concluir o onboarding.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4" /> Onboarding seguro
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-foreground">Criar primeiro tenant operacional</h1>
          </div>
          <Badge variant="outline" className="bg-muted">{status}</Badge>
        </div>
        <div className="rounded-md border bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">
          Use apenas dados ficticios ou formalmente aprovados para staging/beta. CNPJ completo nao deve aparecer em screenshots, logs ou evidencias publicas.
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4" /> Dados da clínica</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); submit(); }}>
              <label className="grid gap-2 text-sm font-medium">
                Nome operacional
                <input className="h-10 rounded-md border px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring" value={name} onChange={(event) => setName(event.target.value)} placeholder="Clinica VetFiscal" required />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Razao social
                <input className="h-10 rounded-md border px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring" value={legalName} onChange={(event) => setLegalName(event.target.value)} placeholder="Clinica VetFiscal LTDA" />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                CNPJ
                <input className="h-10 rounded-md border px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring" value={cnpj} onChange={(event) => setCnpj(event.target.value)} placeholder="00.000.000/0000-00" />
              </label>
              <div className="flex justify-end">
                <Button type="submit" disabled={submitting}>{submitting ? "Criando..." : "Criar tenant"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
