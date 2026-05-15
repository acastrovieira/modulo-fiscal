import type { Role } from "@/shared/security/roles";

export type TenantBootstrapDTO = {
  tenant: {
    id: string;
    name: string;
    legalName: string | null;
    role: Role;
  };
  nextPath: "/dashboard";
};

export type OnboardingStatusDTO = {
  status: "READY" | "NEEDS_TENANT";
  nextPath: "/dashboard" | "/onboarding";
};

export function normalizeCnpj(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length === 14 ? digits : null;
}

export function maskCnpj(value: string | null | undefined): string | null {
  const digits = normalizeCnpj(value);
  if (!digits) return null;
  return `${digits.slice(0, 2)}.***.***/****-${digits.slice(-2)}`;
}
