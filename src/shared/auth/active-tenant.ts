import { cookies } from "next/headers";

export const activeTenantCookieName = "vetfiscal.activeTenantId";
export const activeTenantCookieMaxAgeSeconds = 60 * 60 * 24 * 30;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ActiveTenantCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
};

export function parseRequestedTenantId(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return uuidPattern.test(value) ? value : undefined;
}

export function createActiveTenantCookieOptions(): ActiveTenantCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: activeTenantCookieMaxAgeSeconds
  };
}

export function createExpiredActiveTenantCookieOptions(): ActiveTenantCookieOptions {
  return {
    ...createActiveTenantCookieOptions(),
    maxAge: 0
  };
}

export async function getRequestedTenantId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return parseRequestedTenantId(cookieStore.get(activeTenantCookieName)?.value);
}
