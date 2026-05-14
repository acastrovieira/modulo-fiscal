import { cache } from "react";
import { getRequestedTenantId } from "@/shared/auth/active-tenant";
import type { CurrentTenant } from "@/shared/auth/current-tenant";
import type { CurrentUser } from "@/shared/auth/current-user";
import { localCurrentTenant, localCurrentUser, shouldUseLocalAuthFallback } from "@/shared/auth/local-session";
import { createPrismaSessionRepository } from "@/shared/auth/session-repository";
import { resolveCurrentTenant, resolveCurrentUser } from "@/shared/auth/session-resolver";
import { getSupabaseAuthUser } from "@/shared/auth/supabase-server";

export type CurrentSession = {
  user: CurrentUser;
  tenant: CurrentTenant;
};

export const currentSession = cache(async (): Promise<CurrentSession> => {
  if (shouldUseLocalAuthFallback()) {
    return {
      user: localCurrentUser,
      tenant: localCurrentTenant
    };
  }

  const repository = createPrismaSessionRepository();
  const user = await resolveCurrentUser({
    authUser: await getSupabaseAuthUser(),
    repository
  });
  const tenant = await resolveCurrentTenant({
    userId: user.id,
    activeTenantId: await getRequestedTenantId(),
    repository
  });

  return { user, tenant };
});
