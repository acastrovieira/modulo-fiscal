import { afterEach, describe, expect, it, vi } from "vitest";
import { parseRequestedTenantId } from "@/shared/auth/active-tenant";
import { resolveCurrentTenant, resolveCurrentUser } from "@/shared/auth/session-resolver";
import type { SessionRepository } from "@/shared/auth/session-types";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

function makeRepository(overrides: Partial<SessionRepository> = {}): SessionRepository {
  return {
    findProfileById: vi.fn().mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000001",
      email: "owner@vetfiscal.local",
      name: "Operador VetFiscal",
      status: "ACTIVE"
    }),
    findActiveMembership: vi.fn().mockResolvedValue({
      id: "membership-1",
      tenantId: "11111111-1111-4111-8111-111111111111",
      userId: "00000000-0000-4000-8000-000000000001",
      role: "OWNER",
      status: "ACTIVE",
      tenant: {
        id: "11111111-1111-4111-8111-111111111111",
        name: "Clinica VetFiscal Demo",
        legalName: "Clinica VetFiscal Demo LTDA",
        status: "ACTIVE"
      }
    }),
    ...overrides
  };
}

describe("currentUser/currentTenant contracts", () => {
  it("returns a deterministic user in test", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const { currentUser } = await import("@/shared/auth/current-user");

    await expect(currentUser()).resolves.toEqual({
      id: "00000000-0000-4000-8000-000000000001",
      email: "owner@vetfiscal.local",
      name: "Operador VetFiscal"
    });
  });

  it("returns a deterministic local tenant with role", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const { currentTenant } = await import("@/shared/auth/current-tenant");

    await expect(currentTenant()).resolves.toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      name: "Clinica VetFiscal Demo",
      legalName: "Clinica VetFiscal Demo LTDA",
      role: "OWNER"
    });
  });

  it("uses local fallback only when Local environment is explicit", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "Local");
    const { currentUser } = await import("@/shared/auth/current-user");

    await expect(currentUser()).resolves.toMatchObject({ email: "owner@vetfiscal.local" });
  });

  it("fails predictably outside local/test when Supabase Auth is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "Production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const { currentUser } = await import("@/shared/auth/current-user");

    await expect(currentUser()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("does not enable local OWNER fallback when app env is missing outside tests", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "");
    const { currentUser } = await import("@/shared/auth/current-user");

    await expect(currentUser()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("parses only valid UUID tenant cookies", () => {
    expect(parseRequestedTenantId("11111111-1111-4111-8111-111111111111")).toBe("11111111-1111-4111-8111-111111111111");
    expect(parseRequestedTenantId("not-a-uuid")).toBeUndefined();
    expect(parseRequestedTenantId(undefined)).toBeUndefined();
  });

  it("resolves an authenticated Supabase user through an active profile", async () => {
    const repository = makeRepository();

    await expect(resolveCurrentUser({
      authUser: { id: "00000000-0000-4000-8000-000000000001", email: "owner@auth.local", name: "Auth Name" },
      repository
    })).resolves.toEqual({
      id: "00000000-0000-4000-8000-000000000001",
      email: "owner@vetfiscal.local",
      name: "Operador VetFiscal"
    });
    expect(repository.findProfileById).toHaveBeenCalledWith("00000000-0000-4000-8000-000000000001");
  });

  it("blocks disabled authenticated profiles", async () => {
    const repository = makeRepository({
      findProfileById: vi.fn().mockResolvedValue({
        id: "user-disabled",
        email: "disabled@vetfiscal.local",
        name: null,
        status: "DISABLED"
      })
    });

    await expect(resolveCurrentUser({ authUser: { id: "user-disabled", email: "disabled@auth.local", name: null }, repository })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("resolves current tenant from active membership and requested tenant id", async () => {
    const repository = makeRepository();

    await expect(resolveCurrentTenant({
      userId: "00000000-0000-4000-8000-000000000001",
      activeTenantId: "11111111-1111-4111-8111-111111111111",
      repository
    })).resolves.toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      name: "Clinica VetFiscal Demo",
      legalName: "Clinica VetFiscal Demo LTDA",
      role: "OWNER"
    });
    expect(repository.findActiveMembership).toHaveBeenCalledWith({
      userId: "00000000-0000-4000-8000-000000000001",
      tenantId: "11111111-1111-4111-8111-111111111111"
    });
  });

  it("blocks users without active tenant membership", async () => {
    const repository = makeRepository({ findActiveMembership: vi.fn().mockResolvedValue(null) });

    await expect(resolveCurrentTenant({ userId: "user-without-membership", repository })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
