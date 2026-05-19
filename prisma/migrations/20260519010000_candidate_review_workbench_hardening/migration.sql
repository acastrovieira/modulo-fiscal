ALTER TABLE "fiscal_candidates"
ADD COLUMN "reviewBlockReasons" JSONB,
ADD COLUMN "reviewWarnings" JSONB,
ADD COLUMN "reviewJustification" TEXT;
