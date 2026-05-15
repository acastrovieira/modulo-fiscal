import type { AuditEventInput } from "@/modules/audit/domain/audit-event";
import { currentSession } from "@/shared/auth/current-session";
import { createCorrelationId } from "@/shared/logging/correlation-id";
import { assertPermission } from "@/shared/security/assert-permission";
import { permissionForCommand, type CommandName } from "@/shared/security/command-permissions";
import type { Permission, Role } from "@/shared/security/roles";

export type CommandContext = {
  tenantId: string;
  actorId: string;
  actorRole: Role;
  correlationId: string;
};

export type CommandContextOptions = {
  correlationId?: string;
};

export async function createCommandContext(options: CommandContextOptions = {}): Promise<CommandContext> {
  const { user, tenant } = await currentSession();

  return {
    tenantId: tenant.id,
    actorId: user.id,
    actorRole: tenant.role,
    correlationId: options.correlationId ?? createCorrelationId()
  };
}

export function assertCommandPermission(context: CommandContext, permission: Permission): void {
  assertPermission(
    {
      role: context.actorRole,
      tenantId: context.tenantId,
      userId: context.actorId
    },
    permission
  );
}

export function assertPermissionForCommand(context: CommandContext, commandName: CommandName): void {
  assertCommandPermission(context, permissionForCommand(commandName));
}

export function createCommandAuditEvent(
  context: CommandContext,
  input: Omit<AuditEventInput, "tenantId" | "actorId" | "correlationId">
): AuditEventInput {
  return {
    ...input,
    tenantId: context.tenantId,
    actorId: context.actorId,
    correlationId: context.correlationId
  };
}
