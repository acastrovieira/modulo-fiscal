import { describe, expect, it } from "vitest";
import { ForbiddenError } from "@/shared/errors/application-error";
import { assertPermission } from "@/shared/security/assert-permission";
import { hasPermission } from "@/shared/security/roles";

describe("RBAC permission checks", () => {
  it("allows owners to manage tenant settings", () => {
    expect(hasPermission("OWNER", "tenant.manage")).toBe(true);
  });

  it("blocks fiscal operators from executing issuance", () => {
    expect(() =>
      assertPermission(
        {
          role: "FISCAL_OPERATOR",
          tenantId: "tenant-1",
          userId: "user-1"
        },
        "issuance.execute"
      )
    ).toThrow(ForbiddenError);
  });
});
