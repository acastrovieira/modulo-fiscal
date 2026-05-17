CREATE TYPE "FiscalSimulationProfileStatus" AS ENUM ('DRAFT', 'CONFIGURED', 'BLOCKED');
CREATE TYPE "FiscalServiceTakerStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "FiscalServiceTakerDocumentType" AS ENUM ('CPF', 'CNPJ', 'UNKNOWN');
CREATE TYPE "SimulatedFiscalDocumentStatus" AS ENUM ('DRAFT', 'VALIDATED', 'SIMULATED_ISSUED', 'VOIDED');

CREATE TABLE "fiscal_simulation_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "status" "FiscalSimulationProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "municipalityCode" TEXT NOT NULL,
    "taxRegime" TEXT NOT NULL,
    "serviceDefaultCode" TEXT NOT NULL,
    "simulationMode" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fiscal_simulation_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "fiscal_service_takers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "documentMasked" TEXT NOT NULL,
    "documentHash" TEXT NOT NULL,
    "documentType" "FiscalServiceTakerDocumentType" NOT NULL DEFAULT 'UNKNOWN',
    "emailMasked" TEXT,
    "status" "FiscalServiceTakerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fiscal_service_takers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "simulated_fiscal_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "serviceTakerId" UUID NOT NULL,
    "status" "SimulatedFiscalDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "simulationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalAmountCents" BIGINT NOT NULL DEFAULT 0,
    "fiscalValue" BOOLEAN NOT NULL DEFAULT false,
    "externalTransmission" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" UUID,
    "validatedBy" UUID,
    "validatedAt" TIMESTAMPTZ(6),
    "simulatedBy" UUID,
    "simulatedAt" TIMESTAMPTZ(6),
    "voidedBy" UUID,
    "voidedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "simulated_fiscal_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "simulated_fiscal_document_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "simulatedDocumentId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "serviceCode" TEXT NOT NULL,
    "amountCents" BIGINT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulated_fiscal_document_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "fiscal_simulation_idempotency_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenantId" UUID NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "simulatedDocumentId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fiscal_simulation_idempotency_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fiscal_simulation_profiles_tenantId_key" ON "fiscal_simulation_profiles"("tenantId");
CREATE UNIQUE INDEX "fiscal_service_takers_id_tenantId_key" ON "fiscal_service_takers"("id", "tenantId");
CREATE UNIQUE INDEX "fiscal_service_takers_tenantId_documentHash_key" ON "fiscal_service_takers"("tenantId", "documentHash");
CREATE INDEX "fiscal_service_takers_tenantId_status_createdAt_idx" ON "fiscal_service_takers"("tenantId", "status", "createdAt");
CREATE UNIQUE INDEX "simulated_fiscal_documents_simulationId_key" ON "simulated_fiscal_documents"("simulationId");
CREATE UNIQUE INDEX "simulated_fiscal_documents_id_tenantId_key" ON "simulated_fiscal_documents"("id", "tenantId");
CREATE INDEX "simulated_fiscal_documents_tenantId_status_createdAt_idx" ON "simulated_fiscal_documents"("tenantId", "status", "createdAt");
CREATE INDEX "simulated_fiscal_documents_tenantId_serviceTakerId_idx" ON "simulated_fiscal_documents"("tenantId", "serviceTakerId");
CREATE INDEX "simulated_fiscal_document_items_tenantId_simulatedDocumentId_idx" ON "simulated_fiscal_document_items"("tenantId", "simulatedDocumentId");
CREATE UNIQUE INDEX "fiscal_simulation_idempotency_records_tenantId_operation_idempotencyKey_key" ON "fiscal_simulation_idempotency_records"("tenantId", "operation", "idempotencyKey");
CREATE INDEX "fiscal_simulation_idempotency_records_tenantId_createdAt_idx" ON "fiscal_simulation_idempotency_records"("tenantId", "createdAt");

ALTER TABLE "fiscal_simulation_profiles" ADD CONSTRAINT "fiscal_simulation_profiles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fiscal_service_takers" ADD CONSTRAINT "fiscal_service_takers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "simulated_fiscal_documents" ADD CONSTRAINT "simulated_fiscal_documents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "simulated_fiscal_documents" ADD CONSTRAINT "simulated_fiscal_documents_serviceTakerId_tenantId_fkey" FOREIGN KEY ("serviceTakerId", "tenantId") REFERENCES "fiscal_service_takers"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "simulated_fiscal_document_items" ADD CONSTRAINT "simulated_fiscal_document_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "simulated_fiscal_document_items" ADD CONSTRAINT "simulated_fiscal_document_items_simulatedDocumentId_tenantId_fkey" FOREIGN KEY ("simulatedDocumentId", "tenantId") REFERENCES "simulated_fiscal_documents"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fiscal_simulation_idempotency_records" ADD CONSTRAINT "fiscal_simulation_idempotency_records_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fiscal_simulation_idempotency_records" ADD CONSTRAINT "fiscal_simulation_idempotency_records_simulatedDocumentId_tenantId_fkey" FOREIGN KEY ("simulatedDocumentId", "tenantId") REFERENCES "simulated_fiscal_documents"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;
