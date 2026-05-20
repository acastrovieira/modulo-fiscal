import { ForbiddenError } from "@/shared/errors/application-error";
import { hasPermission, type Permission, type Role } from "@/shared/security/roles";

export type PermissionSubject = {
  role: Role;
  tenantId: string;
  userId: string;
};

export function assertPermission(subject: PermissionSubject, permission: Permission): void {
  if (!hasPermission(subject.role, permission)) {
    throw new ForbiddenError("Voce nao tem permissao para executar esta acao neste tenant.");
  }
}
