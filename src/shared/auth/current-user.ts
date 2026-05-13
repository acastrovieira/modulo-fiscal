import { UnauthorizedError } from "@/shared/errors/application-error";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
};

export async function currentUser(): Promise<CurrentUser> {
  // Supabase Auth will be wired here. The MVP foundation keeps auth explicit and server-side.
  if (process.env.NODE_ENV === "test") {
    return {
      id: "00000000-0000-4000-8000-000000000001",
      email: "owner@vetfiscal.local",
      name: "Operador VetFiscal"
    };
  }

  if (!process.env.NEXT_PUBLIC_APP_ENV || process.env.NEXT_PUBLIC_APP_ENV === "Local") {
    return {
      id: "00000000-0000-4000-8000-000000000001",
      email: "owner@vetfiscal.local",
      name: "Operador VetFiscal"
    };
  }

  throw new UnauthorizedError("Supabase Auth is not configured yet.");
}
