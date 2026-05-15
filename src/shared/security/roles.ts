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
  "documents.download"
] as const;

export type Permission = (typeof permissions)[number];

export const rolePermissions: Record<Role, readonly Permission[]> = {
  OWNER: permissions,
  ADMIN: permissions.filter((permission) => permission !== "issuance.execute"),
  FISCAL_MANAGER: [
    "tenant.switch",
    "fiscal_config.manage",
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
    "imports.create",
    "imports.view",
    "candidates.view",
    "inconsistencies.resolve",
    "batches.simulate",
    "documents.download"
  ],
  FINANCIAL_OPERATOR: ["tenant.switch", "imports.view", "documents.download"],
  ACCOUNTANT: ["tenant.switch", "imports.view", "candidates.view", "audit.view", "documents.download"],
  AUDITOR: ["tenant.switch", "audit.view", "documents.download"]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return (rolePermissions[role] ?? []).includes(permission);
}
