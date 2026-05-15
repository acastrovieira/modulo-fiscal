import type { AuditRecorder } from "@/modules/audit/application/audit-service";
import { maskCnpj, normalizeCnpj, type OnboardingStatusDTO, type TenantBootstrapDTO } from "@/modules/tenant/domain/tenant-bootstrap";
import type { TenantBootstrapRepository } from "@/modules/tenant/application/tenant-bootstrap-types";
import { ForbiddenError, InvalidStateError, UnauthorizedError, ValidationError } from "@/shared/errors/application-error";
import type { AuthProviderUser } from "@/shared/auth/session-types";

export type BootstrapTenantInput = {
  authUser: AuthProviderUser | null;
  name: string;
  legalName?: string | null;
  cnpj?: string | null;
  idempotencyKey: string;
  correlationId: string;
};

function normalizeRequiredName(value: string): string {
  const name = value.trim();
  if (name.length < 3) {
    throw new ValidationError("Tenant name must have at least 3 characters.");
  }
  return name;
}

function assertActiveProfile(profile: Awaited<ReturnType<TenantBootstrapRepository["findProfileById"]>>): void {
  if (profile?.status === "DISABLED") {
    throw new ForbiddenError("Authenticated profile is not active.");
  }
}

function assertAuthUser(authUser: AuthProviderUser | null): asserts authUser is AuthProviderUser & { id: string; email: string } {
  if (!authUser?.id || !authUser.email) {
    throw new UnauthorizedError("Authentication required.");
  }
}

function assertIdempotencyKey(value: string): string {
  const key = value.trim();
  if (!/^[A-Za-z0-9_-]{16,120}$/.test(key)) {
    throw new ValidationError("A valid idempotency key is required.");
  }
  return key;
}

export function createTenantBootstrapService(dependencies: { repository: TenantBootstrapRepository; audit: AuditRecorder }) {
  const { repository, audit } = dependencies;

  return {
    async getOnboardingStatus(input: { authUser: AuthProviderUser | null }): Promise<OnboardingStatusDTO> {
      assertAuthUser(input.authUser);
      const profile = await repository.findProfileById(input.authUser.id);
      assertActiveProfile(profile);

      if (!profile) {
        return { status: "NEEDS_TENANT", nextPath: "/onboarding" };
      }

      const hasTenant = await repository.hasActiveMembership(profile.id);
      return hasTenant ? { status: "READY", nextPath: "/dashboard" } : { status: "NEEDS_TENANT", nextPath: "/onboarding" };
    },

    async bootstrapTenant(input: BootstrapTenantInput): Promise<TenantBootstrapDTO> {
      assertAuthUser(input.authUser);
      const profile = await repository.findProfileById(input.authUser.id);
      assertActiveProfile(profile);

      if (profile && (await repository.hasActiveMembership(profile.id))) {
        throw new InvalidStateError("User already has an active tenant membership.");
      }

      const name = normalizeRequiredName(input.name);
      const legalName = input.legalName?.trim() || null;
      const cnpj = input.cnpj ? normalizeCnpj(input.cnpj) : null;
      const idempotencyKey = assertIdempotencyKey(input.idempotencyKey);

      if (input.cnpj && !cnpj) {
        throw new ValidationError("CNPJ must contain 14 digits when provided.");
      }

      if (cnpj && (await repository.findTenantByCnpj(cnpj))) {
        throw new InvalidStateError("Tenant could not be created with the provided registration data.");
      }

      const result = await repository.bootstrapTenant({
        user: { id: input.authUser.id, email: input.authUser.email.toLowerCase(), name: input.authUser.name },
        name,
        legalName,
        cnpj,
        idempotencyKey
      });

      if (!result.replayed) {
        await audit.record({
          tenantId: result.tenant.id,
          actorId: input.authUser.id,
          correlationId: input.correlationId,
          eventType: "tenant.bootstrap.created",
          entityType: "Tenant",
          entityId: result.tenant.id,
          afterPayload: { status: result.tenant.status, membershipRole: result.membership.role },
          metadata: { cnpjMasked: maskCnpj(result.tenant.cnpj), source: "onboarding" }
        });
      }

      return {
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          legalName: result.tenant.legalName,
          role: result.membership.role
        },
        nextPath: "/dashboard"
      };
    }
  };
}
