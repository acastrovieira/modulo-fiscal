import { describe, expect, it } from "vitest";
import { ForbiddenError } from "@/shared/errors/application-error";
import { assertPermission } from "@/shared/security/assert-permission";
import { commandPermissions, permissionForCommand, type CommandName } from "@/shared/security/command-permissions";
import { hasPermission, permissions, roles } from "@/shared/security/roles";
import { expectedRoleAccess, makeCommandContext, makePermissionSubject } from "../fixtures/security";
import { assertPermissionForCommand } from "@/shared/application/command-context";

describe("RBAC permission checks", () => {
  it("defines access for every initial role", () => {
    for (const role of roles) {
      for (const permission of expectedRoleAccess[role].allowed) {
        expect(hasPermission(role, permission), `${role} should allow ${permission}`).toBe(true);
      }

      for (const permission of expectedRoleAccess[role].denied) {
        expect(hasPermission(role, permission), `${role} should deny ${permission}`).toBe(false);
      }
    }
  });

  it("allows owners to execute every declared permission", () => {
    for (const permission of permissions) {
      expect(() => assertPermission(makePermissionSubject("OWNER"), permission)).not.toThrow();
    }
  });

  it("blocks fiscal operators from approving batches or executing issuance", () => {
    const subject = makePermissionSubject("FISCAL_OPERATOR");

    expect(() => assertPermission(subject, "batches.approve")).toThrow(ForbiddenError);
    expect(() => assertPermission(subject, "issuance.execute")).toThrow(ForbiddenError);
  });

  it("maps every MVP command to a backend permission", () => {
    const expectedCommands: CommandName[] = [
      "createImportFromDocument",
      "validateImport",
      "createFiscalCandidatesFromImport",
      "markCandidateReadyForBatch",
      "openInconsistency",
      "resolveInconsistency",
      "waiveInconsistency",
      "createFiscalBatch",
      "submitBatchForReview",
      "simulateBatchInternally",
      "approveBatchForFutureIssuance",
      "cancelBatch",
      "upsertFiscalSimulationProfile",
      "createFiscalServiceTaker",
      "createSimulatedFiscalDocument",
      "validateSimulatedFiscalDocument",
      "simulateIssueFiscalDocument",
      "voidSimulatedFiscalDocument",
      "evaluateFiscalSimulationScenarios"
    ];

    expect(Object.keys(commandPermissions).sort()).toEqual([...expectedCommands].sort());

    for (const commandName of expectedCommands) {
      expect(permissions).toContain(permissionForCommand(commandName));
    }
  });

  it("enforces command permissions through command context", () => {
    expect(() => assertPermissionForCommand(makeCommandContext("FISCAL_MANAGER"), "approveBatchForFutureIssuance")).not.toThrow();
    expect(() => assertPermissionForCommand(makeCommandContext("FISCAL_OPERATOR"), "approveBatchForFutureIssuance")).toThrow(ForbiddenError);
    expect(() => assertPermissionForCommand(makeCommandContext("AUDITOR"), "resolveInconsistency")).toThrow(ForbiddenError);
  });
});
