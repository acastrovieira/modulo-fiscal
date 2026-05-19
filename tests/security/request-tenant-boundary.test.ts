import { describe, expect, it } from "vitest";
import { readyForBatchRequestSchema } from "@/modules/fiscal/presentation/fiscal-candidate-schemas";
import {
  cancelBatchRequestSchema,
  createBatchRequestSchema,
  emptyBatchTransitionRequestSchema
} from "@/modules/fiscal/presentation/fiscal-batch-schemas";
import {
  closeInconsistencyRequestSchema,
  openInconsistencyRequestSchema
} from "@/modules/fiscal/presentation/fiscal-inconsistency-schemas";
import {
  createFiscalServiceTakerRequestSchema,
  createSimulatedFiscalDocumentRequestSchema,
  evaluateFiscalSimulationScenariosRequestSchema,
  upsertFiscalSimulationProfileRequestSchema
} from "@/modules/fiscal/presentation/fiscal-simulation-schemas";
import {
  createImportRequestSchema,
  validateImportRequestSchema
} from "@/modules/imports/presentation/import-schemas";

const uuid = "11111111-1111-4111-8111-111111111111";

describe("request tenant boundary", () => {
  it.each([
    ["create import", createImportRequestSchema, { documentFileId: uuid }],
    ["validate import", validateImportRequestSchema, { rows: [] }],
    ["ready candidate", readyForBatchRequestSchema, { reviewJustification: "Conferencia humana concluida" }],
    ["open inconsistency", openInconsistencyRequestSchema, { type: "MISSING_AMOUNT", severity: "BLOCKING", message: "Valor ausente" }],
    ["close inconsistency", closeInconsistencyRequestSchema, { resolutionNote: "Revisado" }],
    ["create batch", createBatchRequestSchema, { candidateIds: [uuid] }],
    ["submit/simulate/approve batch", emptyBatchTransitionRequestSchema, {}],
    ["cancel batch", cancelBatchRequestSchema, { reason: "Revisao operacional" }],
    ["upsert simulation profile", upsertFiscalSimulationProfileRequestSchema, { municipalityCode: "3550308", taxRegime: "SIMPLES", serviceDefaultCode: "05.01" }],
    ["create service taker", createFiscalServiceTakerRequestSchema, { name: "Tutor Demo", document: "12345678901" }],
    ["create simulated fiscal document", createSimulatedFiscalDocumentRequestSchema, {
      serviceTakerId: uuid,
      description: "Consulta veterinaria",
      items: [{ description: "Consulta", serviceCode: "05.01", amountCents: 15000 }]
    }],
    ["evaluate simulation scenarios", evaluateFiscalSimulationScenariosRequestSchema, {}]
  ])("%s rejects client-controlled tenantId", (_name, schema, payload) => {
    expect(() => schema.parse({ ...payload, tenantId: uuid })).toThrow();
  });
});
