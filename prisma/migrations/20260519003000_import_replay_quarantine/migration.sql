ALTER TYPE "ImportRowStatus" ADD VALUE 'QUARANTINED';

CREATE TABLE "import_validation_attempts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "importBatchId" UUID NOT NULL,
  "parserVersion" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "totalRows" INTEGER NOT NULL DEFAULT 0,
  "validRows" INTEGER NOT NULL DEFAULT 0,
  "invalidRows" INTEGER NOT NULL DEFAULT 0,
  "duplicateRows" INTEGER NOT NULL DEFAULT 0,
  "createdBy" UUID,
  "correlationId" TEXT NOT NULL,
  "errorsSummary" JSONB,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "import_validation_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "import_validation_attempts_tenantId_importBatchId_createdAt_idx"
  ON "import_validation_attempts"("tenantId", "importBatchId", "createdAt");

CREATE INDEX "import_validation_attempts_tenantId_parserVersion_createdAt_idx"
  ON "import_validation_attempts"("tenantId", "parserVersion", "createdAt");

ALTER TABLE "import_validation_attempts"
  ADD CONSTRAINT "import_validation_attempts_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "import_validation_attempts"
  ADD CONSTRAINT "import_validation_attempts_importBatchId_tenantId_fkey"
  FOREIGN KEY ("importBatchId", "tenantId") REFERENCES "import_batches"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
