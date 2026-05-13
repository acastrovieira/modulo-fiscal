export type TenantStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";

export type Tenant = {
  id: string;
  name: string;
  legalName: string | null;
  cnpj: string | null;
  status: TenantStatus;
};
