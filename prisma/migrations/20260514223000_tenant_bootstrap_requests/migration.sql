CREATE TABLE "tenant_bootstrap_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_bootstrap_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_bootstrap_requests_userId_idempotencyKey_key" ON "tenant_bootstrap_requests"("userId", "idempotencyKey");
CREATE INDEX "tenant_bootstrap_requests_tenantId_idx" ON "tenant_bootstrap_requests"("tenantId");

ALTER TABLE "tenant_bootstrap_requests" ADD CONSTRAINT "tenant_bootstrap_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tenant_bootstrap_requests" ADD CONSTRAINT "tenant_bootstrap_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
