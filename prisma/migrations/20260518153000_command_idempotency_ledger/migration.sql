CREATE TABLE "command_idempotency_records" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "actorId" UUID,
  "operation" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "responseRef" TEXT,
  "status" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "command_idempotency_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "command_idempotency_records_tenantId_operation_idempotencyKey_key"
  ON "command_idempotency_records"("tenantId", "operation", "idempotencyKey");

CREATE INDEX "command_idempotency_records_tenantId_actorId_createdAt_idx"
  ON "command_idempotency_records"("tenantId", "actorId", "createdAt");

CREATE INDEX "command_idempotency_records_tenantId_operation_createdAt_idx"
  ON "command_idempotency_records"("tenantId", "operation", "createdAt");

ALTER TABLE "command_idempotency_records"
  ADD CONSTRAINT "command_idempotency_records_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "command_idempotency_records"
  ADD CONSTRAINT "command_idempotency_records_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
