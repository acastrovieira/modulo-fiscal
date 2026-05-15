"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Sessao server-side com Supabase Auth preparada.");

  async function signIn() {
    setStatus("Validando credenciais...");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const payload = await response.json();

    if (!response.ok) {
      setStatus(payload.error?.message ?? "Nao foi possivel entrar.");
      return;
    }

    window.location.href = "/dashboard";
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
          <Button className="w-full" type="submit">Entrar</Button>
        </form>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">{status}</p>
      </section>
    </main>
  );
}
