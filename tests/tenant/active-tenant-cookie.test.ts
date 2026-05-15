import { describe, expect, it } from "vitest";
import { createActiveTenantCookieOptions, parseRequestedTenantId } from "@/shared/auth/active-tenant";

describe("active tenant cookie", () => {
  it("accepts only uuid tenant ids", () => {
    expect(parseRequestedTenantId("11111111-1111-4111-8111-111111111111")).toBe("11111111-1111-4111-8111-111111111111");
    expect(parseRequestedTenantId("not-a-tenant")).toBeUndefined();
  });

  it("uses secure server-side cookie flags", () => {
    const options = createActiveTenantCookieOptions();

    expect(options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect(options.maxAge).toBeGreaterThan(0);
  });
});
