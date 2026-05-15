"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, LockKeyhole, Send, ShieldCheck, UserMinus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Role } from "@/shared/security/roles";

type TenantOption = { id: string; name: string; legalName: string | null; role: Role; isActive: boolean };
type TenantMember = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: Role;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
};

const inviteRoles: Role[] = ["ADMIN", "FISCAL_MANAGER", "FISCAL_OPERATOR", "FINANCIAL_OPERATOR", "ACCOUNTANT", "AUDITOR"];

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Request failed");
  }
  return payload.data as T;
}

export function TenantAdminPage() {
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("FISCAL_OPERATOR");
  const [status, setStatus] = useState<string>("Carregando dados do tenant...");
  const activeTenant = useMemo(() => tenants.find((tenant) => tenant.isActive), [tenants]);

  async function load() {
    const [tenantData, memberData] = await Promise.all([
      fetchJson<{ tenants: TenantOption[] }>("/api/tenants"),
      fetchJson<{ members: TenantMember[] }>("/api/tenant/members")
    ]);
    setTenants(tenantData.tenants);
    setMembers(memberData.members);
    setStatus("Pronto");
  }

  useEffect(() => {
    load().catch((error: Error) => setStatus(error.message));
  }, []);

  async function switchTenant(tenantId: string) {
    setStatus("Trocando tenant ativo...");
    await fetchJson<TenantOption>("/api/tenants/switch", { method: "POST", body: JSON.stringify({ tenantId }) });
    await load();
  }

  async function inviteMember() {
    setStatus("Registrando convite...");
    await fetchJson("/api/tenant/invites", { method: "POST", body: JSON.stringify({ email, role }) });
    setEmail("");
    await load();
    setStatus("Convite registrado. Envio por e-mail fica fora desta sprint.");
  }

  async function suspendMember(membershipId: string) {
    setStatus("Suspendendo acesso...");
    await fetchJson(`/api/tenant/members/${membershipId}/suspend`, { method: "POST", body: JSON.stringify({}) });
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Building2 className="h-4 w-4" /> Administração do tenant
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-foreground">Acessos, convites e tenant ativo</h1>
        </div>
        <Badge variant="outline" className="w-fit bg-muted">{status}</Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.35fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" /> Tenant ativo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{tenant.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{tenant.legalName ?? "Sem razao social"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tenant.isActive ? "default" : "outline"}>{tenant.role}</Badge>
                  <Button variant={tenant.isActive ? "ghost" : "outline"} onClick={() => switchTenant(tenant.id)} disabled={tenant.isActive}>
                    {tenant.isActive ? "Ativo" : "Ativar"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Send className="h-4 w-4" /> Registrar convite supervisionado</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-[1fr_220px_auto]" onSubmit={(event) => { event.preventDefault(); inviteMember().catch((error: Error) => setStatus(error.message)); }}>
              <input className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring" type="email" placeholder="usuario@clinica.local" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <select className="h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-ring" value={role} onChange={(event) => setRole(event.target.value as Role)}>
                {inviteRoles.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <Button type="submit"><Send className="mr-2 h-4 w-4" /> Registrar</Button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">Convite fica registrado com token hasheado e sem envio real de e-mail nesta sprint.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" /> Membros do tenant {activeTenant ? activeTenant.name : "ativo"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{member.name ?? "Sem nome"}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline">{member.role}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={member.status === "ACTIVE" ? "default" : "secondary"}>{member.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" disabled={member.status !== "ACTIVE"} onClick={() => suspendMember(member.id).catch((error: Error) => setStatus(error.message))}>
                        <UserMinus className="mr-2 h-4 w-4" /> Suspender
                      </Button>
                    </td>
                  </tr>
                ))}
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground"><LockKeyhole className="mx-auto mb-2 h-5 w-5" /> Nenhum membro retornado para o tenant ativo.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

