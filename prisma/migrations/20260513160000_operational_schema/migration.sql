-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'DISABLED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TenantRole" AS ENUM ('OWNER', 'ADMIN', 'FISCAL_MANAGER', 'FISCAL_OPERATOR', 'FINANCIAL_OPERATOR', 'ACCOUNTANT', 'AUDITOR');

-- CreateEnum
CREATE TYPE "ImportBatchStatus" AS ENUM ('PENDING_VALIDATION', 'VALIDATING', 'VALIDATED', 'HAS_ERRORS', 'READY_FOR_REVIEW', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ImportRowStatus" AS ENUM ('RECEIVED', 'NORMALIZED', 'REJECTED', 'CANDIDATE_CREATED');

-- CreateEnum
CREATE TYPE "FiscalCandidateStatus" AS ENUM ('DRAFT', 'NEEDS_REVIEW', 'BLOCKED', 'READY_FOR_BATCH', 'IN_BATCH', 'SIMULATED', 'APPROVED_FOR_FUTURE_ISSUANCE');

-- CreateEnum
CREATE TYPE "FiscalInconsistencyStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'WAIVED');

-- CreateEnum
CREATE TYPE "FiscalInconsistencySeverity" AS ENUM ('BLOCKING', 'REVIEWABLE');

-- CreateEnum
CREATE TYPE "FiscalInconsistencyType" AS ENUM ('MISSING_AMOUNT', 'INVALID_AMOUNT', 'MISSING_COMPETENCE_DATE', 'POSSIBLE_DUPLICATE', 'TENANT_MISMATCH', 'MISSING_SOURCE_DOCUMENT', 'MISSING_CHECKSUM', 'MISSING_CUSTOMER_DATA', 'INCOMPLETE_DESCRIPTION', 'QUESTIONABLE_SERVICE_CLASSIFICATION', 'SOURCE_REVIEW_DIVERGENCE', 'SENSITIVE_DATA_REVIEW');

-- CreateEnum
CREATE TYPE "FiscalBatchStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'SIMULATED', 'APPROVED_FOR_FUTURE_ISSUANCE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FiscalBatchItemStatus" AS ENUM ('INCLUDED', 'REMOVED');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "cnpj" TEXT,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_memberships" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "TenantRole" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "actorId" UUID,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "beforePayload" JSONB,
    "afterPayload" JSONB,
    "metadata" JSONB,
    "correlationId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_files" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "createdBy" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "documentFileId" UUID NOT NULL,
    "createdBy" UUID,
    "status" "ImportBatchStatus" NOT NULL DEFAULT 'PENDING_VALIDATION',
    "sourceType" TEXT NOT NULL DEFAULT 'structured_file',
    "sourceName" TEXT,
    "idempotencyKey" TEXT,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "validRows" INTEGER NOT NULL DEFAULT 0,
    "invalidRows" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "validatedAt" TIMESTAMPTZ(6),
    "archivedAt" TIMESTAMPTZ(6),

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_rows" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "importBatchId" UUID NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "sourceRowId" TEXT,
    "status" "ImportRowStatus" NOT NULL DEFAULT 'RECEIVED',
    "rawPayload" JSONB NOT NULL,
    "normalizedPayload" JSONB,
    "errorPayload" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "import_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiscal_candidates" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "importBatchId" UUID NOT NULL,
    "importRowId" UUID,
    "documentFileId" UUID,
    "customerName" TEXT,
    "customerDocumentMasked" TEXT,
    "serviceDate" DATE,
    "competenceDate" DATE,
    "serviceDescription" TEXT,
    "grossAmountCents" BIGINT,
    "status" "FiscalCandidateStatus" NOT NULL DEFAULT 'DRAFT',
    "fiscalFingerprintVersion" TEXT NOT NULL DEFAULT 'v1',
    "fiscalFingerprint" TEXT NOT NULL,
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fiscal_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiscal_inconsistencies" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "candidateId" UUID,
    "importBatchId" UUID,
    "importRowId" UUID,
    "type" "FiscalInconsistencyType" NOT NULL,
    "severity" "FiscalInconsistencySeverity" NOT NULL,
    "status" "FiscalInconsistencyStatus" NOT NULL DEFAULT 'OPEN',
    "message" TEXT NOT NULL,
    "details" JSONB,
    "resolutionNote" TEXT,
    "resolvedBy" UUID,
    "resolvedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fiscal_inconsistencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiscal_batches" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "status" "FiscalBatchStatus" NOT NULL DEFAULT 'DRAFT',
    "batchNumber" TEXT,
    "createdBy" UUID,
    "submittedBy" UUID,
    "submittedAt" TIMESTAMPTZ(6),
    "simulatedBy" UUID,
    "simulatedAt" TIMESTAMPTZ(6),
    "approvedBy" UUID,
    "approvedAt" TIMESTAMPTZ(6),
    "cancelledBy" UUID,
    "cancelledAt" TIMESTAMPTZ(6),
    "cancelReason" TEXT,
    "totalGrossAmountCents" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fiscal_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiscal_batch_items" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "status" "FiscalBatchItemStatus" NOT NULL DEFAULT 'INCLUDED',
    "grossAmountCents" BIGINT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fiscal_batch_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_cnpj_key" ON "tenants"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "tenant_memberships_tenantId_role_idx" ON "tenant_memberships"("tenantId", "role");

-- CreateIndex
CREATE INDEX "tenant_memberships_userId_idx" ON "tenant_memberships"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_memberships_tenantId_userId_key" ON "tenant_memberships"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "audit_events_tenantId_createdAt_idx" ON "audit_events"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_events_correlationId_idx" ON "audit_events"("correlationId");

-- CreateIndex
CREATE INDEX "audit_events_entityType_entityId_idx" ON "audit_events"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "document_files_tenantId_createdAt_idx" ON "document_files"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "document_files_checksumSha256_idx" ON "document_files"("checksumSha256");

-- CreateIndex
CREATE UNIQUE INDEX "document_files_id_tenantId_key" ON "document_files"("id", "tenantId");

-- CreateIndex
CREATE INDEX "import_batches_tenantId_status_createdAt_idx" ON "import_batches"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "import_batches_tenantId_documentFileId_idx" ON "import_batches"("tenantId", "documentFileId");

-- CreateIndex
CREATE UNIQUE INDEX "import_batches_id_tenantId_key" ON "import_batches"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "import_batches_tenantId_idempotencyKey_key" ON "import_batches"("tenantId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "import_rows_tenantId_importBatchId_status_idx" ON "import_rows"("tenantId", "importBatchId", "status");

-- CreateIndex
CREATE INDEX "import_rows_tenantId_status_idx" ON "import_rows"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "import_rows_id_tenantId_key" ON "import_rows"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "import_rows_importBatchId_rowNumber_key" ON "import_rows"("importBatchId", "rowNumber");

-- CreateIndex
CREATE INDEX "fiscal_candidates_tenantId_status_createdAt_idx" ON "fiscal_candidates"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "fiscal_candidates_tenantId_importBatchId_idx" ON "fiscal_candidates"("tenantId", "importBatchId");

-- CreateIndex
CREATE INDEX "fiscal_candidates_tenantId_importRowId_idx" ON "fiscal_candidates"("tenantId", "importRowId");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_candidates_id_tenantId_key" ON "fiscal_candidates"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_candidates_tenantId_fiscalFingerprintVersion_fiscalF_key" ON "fiscal_candidates"("tenantId", "fiscalFingerprintVersion", "fiscalFingerprint");

-- CreateIndex
CREATE INDEX "fiscal_inconsistencies_tenantId_status_severity_createdAt_idx" ON "fiscal_inconsistencies"("tenantId", "status", "severity", "createdAt");

-- CreateIndex
CREATE INDEX "fiscal_inconsistencies_tenantId_candidateId_status_idx" ON "fiscal_inconsistencies"("tenantId", "candidateId", "status");

-- CreateIndex
CREATE INDEX "fiscal_inconsistencies_tenantId_importBatchId_idx" ON "fiscal_inconsistencies"("tenantId", "importBatchId");

-- CreateIndex
CREATE INDEX "fiscal_inconsistencies_tenantId_importRowId_idx" ON "fiscal_inconsistencies"("tenantId", "importRowId");

-- CreateIndex
CREATE INDEX "fiscal_batches_tenantId_status_createdAt_idx" ON "fiscal_batches"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_batches_id_tenantId_key" ON "fiscal_batches"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_batches_tenantId_batchNumber_key" ON "fiscal_batches"("tenantId", "batchNumber");

-- CreateIndex
CREATE INDEX "fiscal_batch_items_tenantId_batchId_idx" ON "fiscal_batch_items"("tenantId", "batchId");

-- CreateIndex
CREATE INDEX "fiscal_batch_items_tenantId_candidateId_idx" ON "fiscal_batch_items"("tenantId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_batch_items_batchId_candidateId_key" ON "fiscal_batch_items"("batchId", "candidateId");

-- AddForeignKey
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_memberships" ADD CONSTRAINT "tenant_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_files" ADD CONSTRAINT "document_files_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_files" ADD CONSTRAINT "document_files_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_documentFileId_tenantId_fkey" FOREIGN KEY ("documentFileId", "tenantId") REFERENCES "document_files"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_rows" ADD CONSTRAINT "import_rows_importBatchId_tenantId_fkey" FOREIGN KEY ("importBatchId", "tenantId") REFERENCES "import_batches"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_candidates" ADD CONSTRAINT "fiscal_candidates_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_candidates" ADD CONSTRAINT "fiscal_candidates_importBatchId_tenantId_fkey" FOREIGN KEY ("importBatchId", "tenantId") REFERENCES "import_batches"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_candidates" ADD CONSTRAINT "fiscal_candidates_importRowId_tenantId_fkey" FOREIGN KEY ("importRowId", "tenantId") REFERENCES "import_rows"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_candidates" ADD CONSTRAINT "fiscal_candidates_documentFileId_tenantId_fkey" FOREIGN KEY ("documentFileId", "tenantId") REFERENCES "document_files"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_candidates" ADD CONSTRAINT "fiscal_candidates_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_inconsistencies" ADD CONSTRAINT "fiscal_inconsistencies_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_inconsistencies" ADD CONSTRAINT "fiscal_inconsistencies_candidateId_tenantId_fkey" FOREIGN KEY ("candidateId", "tenantId") REFERENCES "fiscal_candidates"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_inconsistencies" ADD CONSTRAINT "fiscal_inconsistencies_importBatchId_tenantId_fkey" FOREIGN KEY ("importBatchId", "tenantId") REFERENCES "import_batches"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_inconsistencies" ADD CONSTRAINT "fiscal_inconsistencies_importRowId_tenantId_fkey" FOREIGN KEY ("importRowId", "tenantId") REFERENCES "import_rows"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_inconsistencies" ADD CONSTRAINT "fiscal_inconsistencies_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_batches" ADD CONSTRAINT "fiscal_batches_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_batches" ADD CONSTRAINT "fiscal_batches_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_batches" ADD CONSTRAINT "fiscal_batches_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_batches" ADD CONSTRAINT "fiscal_batches_simulatedBy_fkey" FOREIGN KEY ("simulatedBy") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_batches" ADD CONSTRAINT "fiscal_batches_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_batches" ADD CONSTRAINT "fiscal_batches_cancelledBy_fkey" FOREIGN KEY ("cancelledBy") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_batch_items" ADD CONSTRAINT "fiscal_batch_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_batch_items" ADD CONSTRAINT "fiscal_batch_items_batchId_tenantId_fkey" FOREIGN KEY ("batchId", "tenantId") REFERENCES "fiscal_batches"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_batch_items" ADD CONSTRAINT "fiscal_batch_items_candidateId_tenantId_fkey" FOREIGN KEY ("candidateId", "tenantId") REFERENCES "fiscal_candidates"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

