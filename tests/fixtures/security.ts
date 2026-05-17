import type { Permission, Role } from "@/shared/security/roles";
import type { PermissionSubject } from "@/shared/security/assert-permission";
import type { CommandContext } from "@/shared/application/command-context";

export const tenantAId = "11111111-1111-4111-8111-111111111111";
export const tenantBId = "22222222-2222-4222-8222-222222222222";
export const userAId = "00000000-0000-4000-8000-000000000001";

export function makePermissionSubject(role: Role, tenantId = tenantAId): PermissionSubject {
  return {
    role,
    tenantId,
    userId: userAId
  };
}

export function makeCommandContext(role: Role = "OWNER", tenantId = tenantAId): CommandContext {
  return {
    tenantId,
    actorId: userAId,
    actorRole: role,
    correlationId: "corr_test"
  };
}

const tenantAdminPermissions: Permission[] = ["tenant.switch", "tenant.members.view", "tenant.members.invite", "tenant.members.suspend", "tenant.invites.resend", "tenant.invites.revoke"];
const fiscalManagerPermissions: Permission[] = [
  "fiscal_config.manage",
  "fiscal_simulation.profile.manage",
  "fiscal_simulation.takers.manage",
  "fiscal_simulation.documents.create",
  "fiscal_simulation.documents.validate",
  "fiscal_simulation.documents.simulate",
  "fiscal_simulation.documents.view",
  "imports.create",
  "imports.view",
  "candidates.view",
  "inconsistencies.resolve",
  "batches.simulate",
  "batches.approve",
  "audit.view",
  "documents.download"
];

export const expectedRoleAccess: Record<Role, { allowed: Permission[]; denied: Permission[] }> = {
  OWNER: {
    allowed: [
      "users.manage",
      "tenant.manage",
      ...tenantAdminPermissions,
      ...fiscalManagerPermissions,
      "issuance.execute"
    ],
    denied: []
  },
  ADMIN: {
    allowed: ["users.manage", "tenant.manage", ...tenantAdminPermissions, ...fiscalManagerPermissions],
    denied: ["issuance.execute"]
  },
  FISCAL_MANAGER: {
    allowed: ["tenant.switch", ...fiscalManagerPermissions],
    denied: ["users.manage", "tenant.manage", "tenant.members.view", "tenant.members.invite", "tenant.members.suspend", "tenant.invites.resend", "tenant.invites.revoke", "issuance.execute"]
  },
  FISCAL_OPERATOR: {
    allowed: [
      "tenant.switch",
      "fiscal_simulation.takers.manage",
      "fiscal_simulation.documents.create",
      "fiscal_simulation.documents.validate",
      "fiscal_simulation.documents.view",
      "imports.create",
      "imports.view",
      "candidates.view",
      "inconsistencies.resolve",
      "batches.simulate",
      "documents.download"
    ],
    denied: ["users.manage", "tenant.manage", "tenant.members.view", "tenant.members.invite", "tenant.members.suspend", "tenant.invites.resend", "tenant.invites.revoke", "batches.approve", "issuance.execute", "audit.view"]
  },
  FINANCIAL_OPERATOR: {
    allowed: ["tenant.switch", "imports.view", "documents.download"],
    denied: ["users.manage", "tenant.manage", "tenant.members.view", "tenant.members.invite", "tenant.members.suspend", "tenant.invites.resend", "tenant.invites.revoke", "fiscal_simulation.profile.manage", "fiscal_simulation.takers.manage", "fiscal_simulation.documents.create", "fiscal_simulation.documents.validate", "fiscal_simulation.documents.simulate", "fiscal_simulation.documents.view", "imports.create", "inconsistencies.resolve", "batches.simulate", "batches.approve", "audit.view"]
  },
  ACCOUNTANT: {
    allowed: ["tenant.switch", "fiscal_simulation.documents.view", "imports.view", "candidates.view", "audit.view", "documents.download"],
    denied: ["users.manage", "tenant.manage", "tenant.members.view", "tenant.members.invite", "tenant.members.suspend", "tenant.invites.resend", "tenant.invites.revoke", "fiscal_simulation.profile.manage", "fiscal_simulation.takers.manage", "fiscal_simulation.documents.create", "fiscal_simulation.documents.validate", "fiscal_simulation.documents.simulate", "imports.create", "inconsistencies.resolve", "batches.simulate", "batches.approve", "issuance.execute"]
  },
  AUDITOR: {
    allowed: ["tenant.switch", "fiscal_simulation.documents.view", "audit.view", "documents.download"],
    denied: ["users.manage", "tenant.manage", "tenant.members.view", "tenant.members.invite", "tenant.members.suspend", "tenant.invites.resend", "tenant.invites.revoke", "fiscal_simulation.profile.manage", "fiscal_simulation.takers.manage", "fiscal_simulation.documents.create", "fiscal_simulation.documents.validate", "fiscal_simulation.documents.simulate", "imports.create", "candidates.view", "inconsistencies.resolve", "batches.simulate", "batches.approve"]
  }
};
