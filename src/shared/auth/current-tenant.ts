import { currentSession } from "@/shared/auth/current-session";
import type { Role } from "@/shared/security/roles";

export type CurrentTenant = {
  id: string;
  name: string;
  legalName: string | null;
  role: Role;
};

export async function currentTenant(): Promise<CurrentTenant> {
  return (await currentSession()).tenant;
}
