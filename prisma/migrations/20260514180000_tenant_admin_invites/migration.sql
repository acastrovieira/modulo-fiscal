CREATE TYPE "TenantInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

CREATE TABLE "tenant_invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "TenantRole" NOT NULL,
    "status" "TenantInviteStatus" NOT NULL DEFAULT 'PENDING',
    "tokenHash" TEXT NOT NULL,
    "invitedBy" UUID,
    "acceptedBy" UUID,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "acceptedAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_invites_tokenHash_key" ON "tenant_invites"("tokenHash");
CREATE UNIQUE INDEX "tenant_invites_tenantId_email_status_key" ON "tenant_invites"("tenantId", "email", "status");
CREATE INDEX "tenant_invites_tenantId_status_expiresAt_idx" ON "tenant_invites"("tenantId", "status", "expiresAt");
CREATE INDEX "tenant_invites_email_idx" ON "tenant_invites"("email");

ALTER TABLE "tenant_invites" ADD CONSTRAINT "tenant_invites_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tenant_invites" ADD CONSTRAINT "tenant_invites_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tenant_invites" ADD CONSTRAINT "tenant_invites_acceptedBy_fkey" FOREIGN KEY ("acceptedBy") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
