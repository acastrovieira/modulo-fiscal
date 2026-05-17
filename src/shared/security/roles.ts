export const roles = [
  "OWNER",
  "ADMIN",
  "FISCAL_MANAGER",
  "FISCAL_OPERATOR",
  "FINANCIAL_OPERATOR",
  "ACCOUNTANT",
  "AUDITOR"
] as const;

export type Role = (typeof roles)[number];

export const permissions = [
  "users.manage",
  "tenant.manage",
  "tenant.switch",
  "tenant.members.view",
  "tenant.members.invite",
  "tenant.members.suspend",
  "tenant.invites.resend",
  "tenant.invites.revoke",
  "fiscal_config.manage",
  "imports.create",
  "imports.view",
  "candidates.view",
  "inconsistencies.resolve",
  "batches.simulate",
  "batches.approve",
  "issuance.execute",
  "audit.view",
  "documents.download",
  "fiscal_simulation.profile.manage",
  "fiscal_simulation.takers.manage",
  "fiscal_simulation.documents.create",
  "fiscal_simulation.documents.validate",
  "fiscal_simulation.documents.simulate",
  "fiscal_simulation.documents.view"
] as const;

export type Permission = (typeof permissions)[number];

export const rolePermissions: Record<Role, readonly Permission[]> = {
  OWNER: permissions,
  ADMIN: permissions.filter((permission) => permission !== "issuance.execute"),
  FISCAL_MANAGER: [
    "tenant.switch",
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
  ],
  FISCAL_OPERATOR: [
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
  FINANCIAL_OPERATOR: ["tenant.switch", "imports.view", "documents.download"],
  ACCOUNTANT: ["tenant.switch", "fiscal_simulation.documents.view", "imports.view", "candidates.view", "audit.view", "documents.download"],
  AUDITOR: ["tenant.switch", "fiscal_simulation.documents.view", "audit.view", "documents.download"]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return (rolePermissions[role] ?? []).includes(permission);
}
