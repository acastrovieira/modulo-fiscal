ALTER TABLE "fiscal_batch_items"
ADD COLUMN "candidateSnapshot" JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX "fiscal_batch_items_tenant_candidate_status_idx"
ON "fiscal_batch_items"("tenantId", "candidateId", "status");
