import { ForbiddenError, UnauthorizedError } from "@/shared/errors/application-error";
import type { CurrentTenant } from "@/shared/auth/current-tenant";
import type { CurrentUser } from "@/shared/auth/current-user";
import type { AuthProviderUser, SessionRepository } from "@/shared/auth/session-types";

export async function resolveCurrentUser(input: {
  authUser: AuthProviderUser | null;
  repository: Pick<SessionRepository, "findProfileById" | "findProfileByEmail">;
}): Promise<CurrentUser> {
  if (!input.authUser) {
    throw new UnauthorizedError("Authentication required.");
  }

  const email = input.authUser.email?.toLowerCase() ?? null;
  const profile = await input.repository.findProfileById(input.authUser.id)
    ?? (email ? await input.repository.findProfileByEmail(email) : null);

  if (!profile) {
    throw new UnauthorizedError("Authenticated profile not found.");
  }

  if (profile.status !== "ACTIVE") {
    throw new ForbiddenError("Authenticated profile is not active.");
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name ?? input.authUser.name ?? profile.email
  };
}

export async function resolveCurrentTenant(input: {
  userId: string;
  activeTenantId?: string;
  repository: Pick<SessionRepository, "findActiveMembership">;
}): Promise<CurrentTenant> {
  const membership = await input.repository.findActiveMembership({ userId: input.userId, tenantId: input.activeTenantId });
  if (!membership) {
    throw new ForbiddenError(input.activeTenantId ? "Tenant membership not found." : "No active tenant membership found.");
  }

  if (membership.status !== "ACTIVE" || membership.tenant.status !== "ACTIVE") {
    throw new ForbiddenError("Tenant membership is not active.");
  }

  return {
    id: membership.tenant.id,
    name: membership.tenant.name,
    legalName: membership.tenant.legalName,
    role: membership.role
  };
}
