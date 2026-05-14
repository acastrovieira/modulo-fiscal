import type { FiscalInconsistency, FiscalInconsistencySeverity, FiscalInconsistencyStatus, FiscalInconsistencyType } from "@/modules/fiscal/domain/fiscal-inconsistency";
import { assertCommandPermission, type CommandContext } from "@/shared/application/command-context";
import { NotFoundError } from "@/shared/errors/application-error";
import { assertTenantScope } from "@/shared/security/tenant-scope";

export type FiscalInconsistencyListRecord = FiscalInconsistency & { createdAt: Date; updatedAt: Date };
export type FiscalInconsistencyDTO = {
  id: string; candidateId: string | null; importBatchId: string | null; importRowId: string | null;
  type: FiscalInconsistencyType; severity: FiscalInconsistencySeverity; status: FiscalInconsistencyStatus;
  message: string; resolutionNote: string | null; resolvedAt: string | null; createdAt: string; updatedAt: string;
};
export type FiscalInconsistencyQueryRepository = {
  listInconsistencies(input: { tenantId: string; status?: FiscalInconsistencyStatus; severity?: FiscalInconsistencySeverity }): Promise<FiscalInconsistencyListRecord[]>;
  findInconsistencyDetail(input: { tenantId: string; id: string }): Promise<FiscalInconsistencyListRecord | null>;
};
export function toInconsistencyDTO(record: FiscalInconsistencyListRecord): FiscalInconsistencyDTO {
  return { id: record.id, candidateId: record.candidateId, importBatchId: record.importBatchId, importRowId: record.importRowId, type: record.type, severity: record.severity, status: record.status, message: record.message, resolutionNote: record.resolutionNote, resolvedAt: record.resolvedAt?.toISOString() ?? null, createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString() };
}
export async function listInconsistencies(input: { context: CommandContext; repository: FiscalInconsistencyQueryRepository; status?: FiscalInconsistencyStatus; severity?: FiscalInconsistencySeverity }): Promise<FiscalInconsistencyDTO[]> {
  assertCommandPermission(input.context, "candidates.view");
  const rows = await input.repository.listInconsistencies({ tenantId: input.context.tenantId, status: input.status, severity: input.severity });
  return rows.map((row) => { assertTenantScope(input.context.tenantId, row); return toInconsistencyDTO(row); });
}
export async function getInconsistency(input: { context: CommandContext; repository: FiscalInconsistencyQueryRepository; inconsistencyId: string }): Promise<FiscalInconsistencyDTO> {
  assertCommandPermission(input.context, "candidates.view");
  const row = await input.repository.findInconsistencyDetail({ tenantId: input.context.tenantId, id: input.inconsistencyId });
  if (!row) throw new NotFoundError("Fiscal inconsistency not found.");
  assertTenantScope(input.context.tenantId, row);
  return toInconsistencyDTO(row);
}