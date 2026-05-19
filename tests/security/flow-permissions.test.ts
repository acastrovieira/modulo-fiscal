import { describe, expect, it } from "vitest";
import { assertPermissionForCommand } from "@/shared/application/command-context";
import { commandPermissions, permissionForCommand, type CommandName } from "@/shared/security/command-permissions";
import { hasPermission, roles, type Role } from "@/shared/security/roles";
import { makeCommandContext } from "../fixtures/security";

const flowCommands: Array<{
  command: CommandName;
  flow: string;
  stateGate: string;
}> = [
  { command: "createImportFromDocument", flow: "imports", stateGate: "document exists in tenant" },
  { command: "validateImport", flow: "imports", stateGate: "import is pending validation or has errors" },
  { command: "createFiscalCandidatesFromImport", flow: "candidates", stateGate: "import is validated or ready for review" },
  { command: "markCandidateReadyForBatch", flow: "candidates", stateGate: "candidate is reviewable and has no open blocking inconsistency" },
  { command: "openInconsistency", flow: "inconsistencies", stateGate: "target entity belongs to tenant" },
  { command: "resolveInconsistency", flow: "inconsistencies", stateGate: "inconsistency is open or in review" },
  { command: "waiveInconsistency", flow: "inconsistencies", stateGate: "inconsistency is open or in review" },
  { command: "createFiscalBatch", flow: "batches", stateGate: "candidates are ready for batch" },
  { command: "submitBatchForReview", flow: "batches", stateGate: "batch is draft" },
  { command: "simulateBatchInternally", flow: "batches", stateGate: "batch is in review" },
  { command: "approveBatchForFutureIssuance", flow: "batches", stateGate: "batch is simulated" },
  { command: "cancelBatch", flow: "batches", stateGate: "batch is cancellable" },
  { command: "upsertFiscalSimulationProfile", flow: "fiscal simulation", stateGate: "tenant profile is editable" },
  { command: "createFiscalServiceTaker", flow: "fiscal simulation", stateGate: "taker payload is masked/hashable" },
  { command: "createSimulatedFiscalDocument", flow: "fiscal simulation", stateGate: "profile and taker are active" },
  { command: "validateSimulatedFiscalDocument", flow: "fiscal simulation", stateGate: "document is draft" },
  { command: "simulateIssueFiscalDocument", flow: "fiscal simulation", stateGate: "document is validated" },
  { command: "voidSimulatedFiscalDocument", flow: "fiscal simulation", stateGate: "document is not voided" },
  { command: "evaluateFiscalSimulationScenarios", flow: "fiscal simulation", stateGate: "document is tenant scoped" }
];

describe("RBAC flow permission matrix", () => {
  it("documents every declared command in the flow matrix", () => {
    expect(flowCommands.map((entry) => entry.command).sort()).toEqual(Object.keys(commandPermissions).sort());
  });

  it.each(flowCommands)("$command uses a declared backend permission", ({ command }) => {
    expect(permissionForCommand(command)).toBe(commandPermissions[command]);
  });

  it.each(flowCommands)("$command only allows roles with its mapped permission", ({ command }) => {
    const permission = permissionForCommand(command);

    for (const role of roles) {
      const assertion = expect(() => assertPermissionForCommand(makeCommandContext(role), command));
      if (hasPermission(role, permission)) {
        assertion.not.toThrow();
      } else {
        assertion.toThrow();
      }
    }
  });

  it("keeps fiscal operators out of approval and audit-only roles out of mutations", () => {
    const denied: Array<[Role, CommandName]> = [
      ["FISCAL_OPERATOR", "approveBatchForFutureIssuance"],
      ["FISCAL_OPERATOR", "cancelBatch"],
      ["ACCOUNTANT", "simulateBatchInternally"],
      ["ACCOUNTANT", "markCandidateReadyForBatch"],
      ["AUDITOR", "createImportFromDocument"],
      ["AUDITOR", "resolveInconsistency"],
      ["AUDITOR", "createSimulatedFiscalDocument"]
    ];

    for (const [role, command] of denied) {
      expect(() => assertPermissionForCommand(makeCommandContext(role), command)).toThrow();
    }
  });
});
