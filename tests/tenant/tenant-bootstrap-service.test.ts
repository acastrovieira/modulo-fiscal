import { describe, expect, it, vi } from "vitest";
import { createTenantBootstrapService } from "@/modules/tenant/application/tenant-bootstrap-service";
import type { TenantBootstrapRepository } from "@/modules/tenant/application/tenant-bootstrap-types";
import { ForbiddenError, InvalidStateError, UnauthorizedError, ValidationError } from "@/shared/errors/application-error";
import { tenantAId, userAId } from "../fixtures/security";

function makeRepository(overrides: Partial<TenantBootstrapRepository> = {}): TenantBootstrapRepository {
  return {
    async findProfileById() {
      return { id: userAId, email: "owner@vetfiscal.local", name: "Owner", status: "ACTIVE" };
    },
    async hasActiveMembership() {
      return false;
    },
    async findTenantByCnpj() {
      return null;
    },
    async bootstrapTenant(input) {
      return {
        tenant: { id: tenantAId, name: input.name, legalName: input.legalName, cnpj: input.cnpj, status: "ACTIVE" },
        membership: { id: "membership-1", tenantId: tenantAId, userId: input.user.id, role: "OWNER", status: "ACTIVE" },
        replayed: false
      };
    },
    ...overrides
  };
}

function makeAudit() {
  return { record: vi.fn(async () => undefined) };
}

const authUser = { id: userAId, email: "owner@vetfiscal.local", name: "Owner" };

describe("tenant bootstrap service", () => {
  it("returns onboarding status for authenticated users without tenant", async () => {
    const service = createTenantBootstrapService({ repository: makeRepository(), audit: makeAudit() });

    await expect(service.getOnboardingStatus({ authUser })).resolves.toEqual({ status: "NEEDS_TENANT", nextPath: "/onboarding" });
  });

  it("returns dashboard status for authenticated users with active membership", async () => {
    const service = createTenantBootstrapService({ repository: makeRepository({ async hasActiveMembership() { return true; } }), audit: makeAudit() });

    await expect(service.getOnboardingStatus({ authUser })).resolves.toEqual({ status: "READY", nextPath: "/dashboard" });
  });

  it("creates the first tenant and OWNER membership with audit redaction", async () => {
    const audit = makeAudit();
    const service = createTenantBootstrapService({ repository: makeRepository(), audit });

    const result = await service.bootstrapTenant({
      authUser,
      name: "Clinica Bootstrap",
      legalName: "Clinica Bootstrap LTDA",
      cnpj: "12.345.678/0001-95",
      idempotencyKey: "bootstrap-key-0001",
      correlationId: "corr_bootstrap"
    });

    expect(result).toEqual({
      tenant: { id: tenantAId, name: "Clinica Bootstrap", legalName: "Clinica Bootstrap LTDA", role: "OWNER" },
      nextPath: "/dashboard"
    });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "tenant.bootstrap.created", metadata: expect.objectContaining({ cnpjMasked: "12.***.***/****-95" }) }));
    expect(JSON.stringify(audit.record.mock.calls)).not.toContain("12345678000195");
  });

  it("blocks unauthenticated and disabled users", async () => {
    const service = createTenantBootstrapService({ repository: makeRepository(), audit: makeAudit() });
    await expect(service.getOnboardingStatus({ authUser: null })).rejects.toBeInstanceOf(UnauthorizedError);

    const disabled = createTenantBootstrapService({ repository: makeRepository({ async findProfileById() { return { id: userAId, email: "owner@vetfiscal.local", name: null, status: "DISABLED" }; } }), audit: makeAudit() });
    await expect(disabled.bootstrapTenant({ authUser, name: "Clinica", idempotencyKey: "bootstrap-key-0002", correlationId: "corr" })).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("blocks duplicate active membership and duplicate CNPJ without enumeration detail", async () => {
    const withTenant = createTenantBootstrapService({ repository: makeRepository({ async hasActiveMembership() { return true; } }), audit: makeAudit() });
    await expect(withTenant.bootstrapTenant({ authUser, name: "Clinica", idempotencyKey: "bootstrap-key-0003", correlationId: "corr" })).rejects.toBeInstanceOf(InvalidStateError);

    const duplicateCnpj = createTenantBootstrapService({ repository: makeRepository({ async findTenantByCnpj() { return { id: tenantAId, name: "Existing", legalName: null, cnpj: "12345678000195", status: "ACTIVE" }; } }), audit: makeAudit() });
    await expect(duplicateCnpj.bootstrapTenant({ authUser, name: "Clinica", cnpj: "12.345.678/0001-95", idempotencyKey: "bootstrap-key-0004", correlationId: "corr" })).rejects.toMatchObject({ message: "Tenant could not be created with the provided registration data." });
  });

  it("validates CNPJ and idempotency key", async () => {
    const service = createTenantBootstrapService({ repository: makeRepository(), audit: makeAudit() });

    await expect(service.bootstrapTenant({ authUser, name: "Clinica", cnpj: "123", idempotencyKey: "bootstrap-key-0005", correlationId: "corr" })).rejects.toBeInstanceOf(ValidationError);
    await expect(service.bootstrapTenant({ authUser, name: "Clinica", idempotencyKey: "short", correlationId: "corr" })).rejects.toBeInstanceOf(ValidationError);
  });

  it("does not duplicate audit on idempotent replay", async () => {
    const audit = makeAudit();
    const service = createTenantBootstrapService({
      repository: makeRepository({
        async bootstrapTenant(input) {
          return {
            tenant: { id: tenantAId, name: input.name, legalName: input.legalName, cnpj: input.cnpj, status: "ACTIVE" },
            membership: { id: "membership-1", tenantId: tenantAId, userId: input.user.id, role: "OWNER", status: "ACTIVE" },
            replayed: true
          };
        }
      }),
      audit
    });

    await expect(service.bootstrapTenant({ authUser, name: "Clinica", idempotencyKey: "bootstrap-key-0006", correlationId: "corr" })).resolves.toMatchObject({ nextPath: "/dashboard" });
    expect(audit.record).not.toHaveBeenCalled();
  });
});
