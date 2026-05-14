export const localCurrentUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "owner@vetfiscal.local",
  name: "Operador VetFiscal"
} as const;

export const localCurrentTenant = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Clinica VetFiscal Demo",
  legalName: "Clinica VetFiscal Demo LTDA",
  role: "OWNER"
} as const;

export function shouldUseLocalAuthFallback(): boolean {
  return process.env.NODE_ENV === "test" || process.env.NEXT_PUBLIC_APP_ENV === "Local";
}
