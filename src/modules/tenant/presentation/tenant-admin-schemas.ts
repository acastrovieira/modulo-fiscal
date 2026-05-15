import { z } from "zod";
import { roles } from "@/shared/security/roles";

const inviteableRoles = roles.filter((role) => role !== "OWNER");

export const switchTenantRequestSchema = z.object({
  tenantId: z.string().uuid()
}).strict();

export const inviteTenantMemberRequestSchema = z.object({
  email: z.string().email().max(254),
  role: z.enum(inviteableRoles as [Exclude<(typeof roles)[number], "OWNER">, ...Exclude<(typeof roles)[number], "OWNER">[]])
}).strict();

export const suspendTenantMemberRequestSchema = z.object({
  reason: z.string().trim().max(280).optional()
}).strict();
