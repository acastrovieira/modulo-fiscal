import { cookies } from "next/headers";

export const activeTenantCookieName = "vetfiscal.activeTenantId";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseRequestedTenantId(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return uuidPattern.test(value) ? value : undefined;
}

export async function getRequestedTenantId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return parseRequestedTenantId(cookieStore.get(activeTenantCookieName)?.value);
}
