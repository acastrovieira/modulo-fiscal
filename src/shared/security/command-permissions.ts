import type { Permission } from "@/shared/security/roles";

export const commandPermissions = {
  createImportFromDocument: "imports.create",
  validateImport: "imports.create",
  createFiscalCandidatesFromImport: "imports.create",
  markCandidateReadyForBatch: "inconsistencies.resolve",
  openInconsistency: "inconsistencies.resolve",
  resolveInconsistency: "inconsistencies.resolve",
  waiveInconsistency: "inconsistencies.resolve",
  createFiscalBatch: "batches.simulate",
  submitBatchForReview: "batches.simulate",
  simulateBatchInternally: "batches.simulate",
  approveBatchForFutureIssuance: "batches.approve",
  cancelBatch: "batches.approve",
  upsertFiscalSimulationProfile: "fiscal_simulation.profile.manage",
  createFiscalServiceTaker: "fiscal_simulation.takers.manage",
  createSimulatedFiscalDocument: "fiscal_simulation.documents.create",
  validateSimulatedFiscalDocument: "fiscal_simulation.documents.validate",
  simulateIssueFiscalDocument: "fiscal_simulation.documents.simulate",
  voidSimulatedFiscalDocument: "fiscal_simulation.documents.simulate"
} as const satisfies Record<string, Permission>;

export type CommandName = keyof typeof commandPermissions;

export function permissionForCommand(commandName: CommandName): Permission {
  return commandPermissions[commandName];
}
