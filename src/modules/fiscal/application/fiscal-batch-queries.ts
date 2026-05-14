import type { FiscalBatchItemRecord, FiscalBatchRecord } from "@/modules/fiscal/application/fiscal-batch-service";
import type { FiscalBatchStatus } from "@/modules/fiscal/domain/fiscal-batch";
import { assertCommandPermission, type CommandContext } from "@/shared/application/command-context";
import { NotFoundError } from "@/shared/errors/application-error";
import { assertTenantScope } from "@/shared/security/tenant-scope";

export type FiscalBatchListRecord = FiscalBatchRecord & { createdAt: Date; updatedAt: Date; itemsCount: number };
export type FiscalBatchItemDTO = { id: string; candidateId: string; status: FiscalBatchItemRecord["status"]; grossAmountCents: string };
export type FiscalBatchDTO = {
  id: string; status: FiscalBatchStatus; batchNumber: string | null; totalGrossAmountCents: string; itemsCount: number;
  submittedAt: string | null; simulatedAt: string | null; approvedAt: string | null; cancelledAt: string | null; cancelReason: string | null;
  createdAt: string; updatedAt: string; items?: FiscalBatchItemDTO[];
};
export type FiscalBatchQueryRepository = {
  listBatches(input: { tenantId: string; status?: FiscalBatchStatus }): Promise<FiscalBatchListRecord[]>;
  findBatchDetail(input: { tenantId: string; id: string }): Promise<FiscalBatchListRecord | null>;
};
export function toBatchDTO(record: FiscalBatchListRecord): FiscalBatchDTO {
  return { id: record.id, status: record.status, batchNumber: record.batchNumber, totalGrossAmountCents: record.totalGrossAmountCents.toString(), itemsCount: record.itemsCount, submittedAt: record.submittedAt?.toISOString() ?? null, simulatedAt: record.simulatedAt?.toISOString() ?? null, approvedAt: record.approvedAt?.toISOString() ?? null, cancelledAt: record.cancelledAt?.toISOString() ?? null, cancelReason: record.cancelReason, createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString(), items: record.items?.map((item) => { assertTenantScope(record.tenantId, item); return { id: item.id, candidateId: item.candidateId, status: item.status, grossAmountCents: item.grossAmountCents.toString() }; }) };
}
export async function listBatches(input: { context: CommandContext; repository: FiscalBatchQueryRepository; status?: FiscalBatchStatus }): Promise<FiscalBatchDTO[]> {
  assertCommandPermission(input.context, "batches.simulate");
  const batches = await input.repository.listBatches({ tenantId: input.context.tenantId, status: input.status });
  return batches.map((batch) => { assertTenantScope(input.context.tenantId, batch); return toBatchDTO(batch); });
}
export async function getBatch(input: { context: CommandContext; repository: FiscalBatchQueryRepository; batchId: string }): Promise<FiscalBatchDTO> {
  assertCommandPermission(input.context, "batches.simulate");
  const batch = await input.repository.findBatchDetail({ tenantId: input.context.tenantId, id: input.batchId });
  if (!batch) throw new NotFoundError("Fiscal batch not found.");
  assertTenantScope(input.context.tenantId, batch);
  return toBatchDTO(batch);
}