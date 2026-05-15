import type { Role } from "@/shared/security/roles";

export type TenantOptionDTO = {
  id: string;
  name: string;
  legalName: string | null;
  role: Role;
  isActive: boolean;
};

export type TenantMemberDTO = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: Role;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
};

export type TenantInviteDTO = {
  id: string;
  emailMasked: string;
  role: Role;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  expiresAt: string;
  createdAt: string;
  deliveryStatus: "NOT_CONFIGURED";
};

export function maskEmail(email: string): string {
  const [localPart = "", domain = ""] = email.toLowerCase().split("@");
  if (!domain) return "***";
  const visible = localPart.slice(0, 2).padEnd(Math.min(localPart.length, 2), "*");
  return `${visible}${localPart.length > 2 ? "***" : ""}@${domain}`;
}

export function normalizeInviteEmail(email: string): string {
  return email.trim().toLowerCase();
}
