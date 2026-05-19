import type { Prisma } from "@prisma/client";
import type { FiscalInconsistencyQueryRepository, FiscalInconsistencyListRecord } from "@/modules/fiscal/application/fiscal-inconsistency-queries";
import type { CreateFiscalInconsistencyInput, FiscalInconsistencyRepository } from "@/modules/fiscal/application/fiscal-inconsistency-service";
import type { FiscalCandidateRecord, FiscalImportBatchRecord, FiscalImportRowRecord } from "@/modules/fiscal/application/fiscal-candidate-service";
import type { FiscalInconsistency } from "@/modules/fiscal/domain/fiscal-inconsistency";
import { prisma } from "@/shared/database/prisma";

type Candidate = NonNullable<Awaited<ReturnType<typeof prisma.fiscalCandidate.findFirst>>>;
type ImportBatch = NonNullable<Awaited<ReturnType<typeof prisma.importBatch.findFirst>>>;
type ImportRow = NonNullable<Awaited<ReturnType<typeof prisma.importRow.findFirst>>>;
type Inconsistency = NonNullable<Awaited<ReturnType<typeof prisma.fiscalInconsistency.findFirst>>>;
function candidateRecord(c: Candidate): FiscalCandidateRecord { return { id: c.id, tenantId: c.tenantId, importBatchId: c.importBatchId, importRowId: c.importRowId, documentFileId: c.documentFileId, customerName: c.customerName, customerDocumentMasked: c.customerDocumentMasked, serviceDate: c.serviceDate, competenceDate: c.competenceDate, serviceDescription: c.serviceDescription, grossAmountCents: c.grossAmountCents, status: c.status, fiscalFingerprintVersion: c.fiscalFingerprintVersion, fiscalFingerprint: c.fiscalFingerprint, reviewBlockReasons: Array.isArray(c.reviewBlockReasons) ? c.reviewBlockReasons as FiscalCandidateRecord["reviewBlockReasons"] : [], reviewWarnings: Array.isArray(c.reviewWarnings) ? c.reviewWarnings as FiscalCandidateRecord["reviewWarnings"] : [], reviewJustification: c.reviewJustification, reviewedBy: c.reviewedBy, reviewedAt: c.reviewedAt }; }
function batchRecord(b: ImportBatch): FiscalImportBatchRecord { return { id: b.id, tenantId: b.tenantId, documentFileId: b.documentFileId, status: b.status }; }
function rowRecord(r: ImportRow): FiscalImportRowRecord { return { id: r.id, tenantId: r.tenantId, importBatchId: r.importBatchId, status: r.status, normalizedPayload: r.normalizedPayload }; }
function inconsistencyRecord(i: Inconsistency): FiscalInconsistency { return { id: i.id, tenantId: i.tenantId, candidateId: i.candidateId, importBatchId: i.importBatchId, importRowId: i.importRowId, type: i.type, severity: i.severity, status: i.status, message: i.message, details: i.details, resolutionNote: i.resolutionNote, resolvedBy: i.resolvedBy, resolvedAt: i.resolvedAt }; }
function inconsistencyListRecord(i: Inconsistency): FiscalInconsistencyListRecord { return { ...inconsistencyRecord(i), createdAt: i.createdAt, updatedAt: i.updatedAt }; }
function jsonValue(value: unknown): Prisma.InputJsonValue | undefined { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue; }
export function createPrismaFiscalInconsistencyRepository(): FiscalInconsistencyRepository & FiscalInconsistencyQueryRepository {
  return {
    async findCandidateById(id: string) { const c = await prisma.fiscalCandidate.findUnique({ where: { id } }); return c ? candidateRecord(c) : null; },
    async findImportBatchById(id: string) { const b = await prisma.importBatch.findUnique({ where: { id } }); return b ? batchRecord(b) : null; },
    async findImportRowById(id: string) { const r = await prisma.importRow.findUnique({ where: { id } }); return r ? rowRecord(r) : null; },
    async createInconsistency(input: CreateFiscalInconsistencyInput) { const i = await prisma.fiscalInconsistency.create({ data: { tenantId: input.tenantId, candidateId: input.candidateId ?? null, importBatchId: input.importBatchId ?? null, importRowId: input.importRowId ?? null, type: input.type, severity: input.severity, status: input.status, message: input.message, details: jsonValue(input.details) } }); return inconsistencyRecord(i); },
    async findInconsistencyById(id: string) { const i = await prisma.fiscalInconsistency.findUnique({ where: { id } }); return i ? inconsistencyRecord(i) : null; },
    async updateInconsistency(input) { const i = await prisma.fiscalInconsistency.update({ where: { id: input.id }, data: { status: input.status, resolutionNote: input.resolutionNote, resolvedBy: input.resolvedBy, resolvedAt: input.resolvedAt } }); return inconsistencyRecord(i); },
    async updateCandidateStatus(candidateId, tenantId, status) { const c = await prisma.fiscalCandidate.update({ where: { id_tenantId: { id: candidateId, tenantId } }, data: { status } }); return candidateRecord(c); },
    async countOpenBlockingInconsistenciesByCandidateId(candidateId, tenantId) { return prisma.fiscalInconsistency.count({ where: { candidateId, tenantId, severity: "BLOCKING", status: { in: ["OPEN", "IN_REVIEW"] } } }); },
    async listInconsistencies(input) { const rows = await prisma.fiscalInconsistency.findMany({ where: { tenantId: input.tenantId, status: input.status, severity: input.severity }, orderBy: { createdAt: "desc" }, take: 50 }); return rows.map(inconsistencyListRecord); },
    async findInconsistencyDetail(input) { const row = await prisma.fiscalInconsistency.findUnique({ where: { id: input.id } }); return row ? inconsistencyListRecord(row) : null; }
  };
}
