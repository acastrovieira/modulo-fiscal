import { currentUser } from "@/shared/auth/current-user";
import type { Role } from "@/shared/security/roles";

export type CurrentTenant = {
  id: string;
  name: string;
  legalName: string;
  role: Role;
};

export async function currentTenant(): Promise<CurrentTenant> {
  await currentUser();

  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Clínica VetFiscal Demo",
    legalName: "Clínica VetFiscal Demo LTDA",
    role: "OWNER"
  };
}
