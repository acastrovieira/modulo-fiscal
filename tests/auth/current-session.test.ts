import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

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

  it("fails predictably outside local/test when Supabase Auth is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "Production");
    const { currentUser } = await import("@/shared/auth/current-user");

    await expect(currentUser()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});