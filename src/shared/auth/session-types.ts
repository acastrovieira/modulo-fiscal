import type { Role } from "@/shared/security/roles";

export type AuthProviderUser = {
  id: string;
  email: string | null;
  name: string | null;
};

export type SessionProfileRecord = {
  id: string;
  email: string;
  name: string | null;
  status: "ACTIVE" | "INVITED" | "DISABLED";
};

export type SessionTenantMembershipRecord = {
  id: string;
  tenantId: string;
  userId: string;
  role: Role;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  tenant: {
    id: string;
    name: string;
    legalName: string | null;
    status: "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  };
};

export type SessionRepository = {
  findProfileById(userId: string): Promise<SessionProfileRecord | null>;
  findActiveMembership(input: { userId: string; tenantId?: string }): Promise<SessionTenantMembershipRecord | null>;
};
