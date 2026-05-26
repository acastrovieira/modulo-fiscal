import type { Role } from "@/shared/security/roles";

export type TenantBootstrapProfileRecord = {
  id: string;
  email: string;
  name: string | null;
  status: "ACTIVE" | "INVITED" | "DISABLED";
};

export type TenantBootstrapMembershipRecord = {
  id: string;
  tenantId: string;
  userId: string;
  role: Role;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
};

export type TenantBootstrapRecord = {
  id: string;
  name: string;
  legalName: string | null;
  cnpj: string | null;
  status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
};

export type TenantBootstrapUserInput = {
  id: string;
  email: string;
  name: string | null;
};

export type TenantBootstrapRepository = {
  findProfileById(userId: string): Promise<TenantBootstrapProfileRecord | null>;
  findProfileByEmail(email: string): Promise<TenantBootstrapProfileRecord | null>;
  hasActiveMembership(userId: string): Promise<boolean>;
  findTenantByCnpj(cnpj: string): Promise<TenantBootstrapRecord | null>;
  bootstrapTenant(input: {
    user: TenantBootstrapUserInput;
    name: string;
    legalName: string | null;
    cnpj: string | null;
    idempotencyKey: string;
  }): Promise<{ tenant: TenantBootstrapRecord; membership: TenantBootstrapMembershipRecord; replayed: boolean }>;
};
