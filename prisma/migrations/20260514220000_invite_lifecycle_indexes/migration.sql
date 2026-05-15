DROP INDEX IF EXISTS "tenant_invites_tenantId_email_status_key";

CREATE UNIQUE INDEX "tenant_invites_pending_email_key"
ON "tenant_invites"("tenantId", "email")
WHERE "status" = 'PENDING';
