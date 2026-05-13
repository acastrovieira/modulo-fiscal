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

export const expectedRoleAccess: Record<Role, { allowed: Permission[]; denied: Permission[] }> = {
  OWNER: {
    allowed: [
      "users.manage",
      "tenant.manage",
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
    ],
    denied: []
  },
  ADMIN: {
    allowed: [
      "users.manage",
      "tenant.manage",
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
    denied: ["issuance.execute"]
  },
  FISCAL_MANAGER: {
    allowed: [
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
    denied: ["users.manage", "tenant.manage", "issuance.execute"]
  },
  FISCAL_OPERATOR: {
    allowed: [
      "imports.create",
      "imports.view",
      "candidates.view",
      "inconsistencies.resolve",
      "batches.simulate",
      "documents.download"
    ],
    denied: ["users.manage", "tenant.manage", "batches.approve", "issuance.execute", "audit.view"]
  },
  FINANCIAL_OPERATOR: {
    allowed: ["imports.view", "documents.download"],
    denied: ["imports.create", "inconsistencies.resolve", "batches.simulate", "batches.approve", "audit.view"]
  },
  ACCOUNTANT: {
    allowed: ["imports.view", "candidates.view", "audit.view", "documents.download"],
    denied: ["imports.create", "inconsistencies.resolve", "batches.simulate", "batches.approve", "issuance.execute"]
  },
  AUDITOR: {
    allowed: ["audit.view", "documents.download"],
    denied: ["imports.create", "candidates.view", "inconsistencies.resolve", "batches.simulate", "batches.approve"]
  }
};