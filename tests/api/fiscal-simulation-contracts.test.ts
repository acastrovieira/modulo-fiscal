import { describe, expect, it } from "vitest";
import {
  createFiscalServiceTakerRequestSchema,
  createSimulatedFiscalDocumentRequestSchema,
  toFiscalServiceTakerDTO,
  toSimulatedFiscalDocumentDTO
} from "@/modules/fiscal/presentation/fiscal-simulation-schemas";
import type { FiscalServiceTaker, SimulatedFiscalDocument } from "@/modules/fiscal/domain/fiscal-simulation";

function makeTaker(overrides: Partial<FiscalServiceTaker> = {}): FiscalServiceTaker {
  return {
    id: "taker-1",
    tenantId: "tenant-1",
    name: "Maria Tutora",
    documentMasked: "***.456.789-**",
    documentHash: "hash_should_not_leave_backend",
    documentType: "CPF",
    emailMasked: "ma***@vetfiscal.local",
    status: "ACTIVE",
    ...overrides
  };
}

function makeDocument(overrides: Partial<SimulatedFiscalDocument> = {}): SimulatedFiscalDocument {
  return {
    id: "simdoc-1",
    tenantId: "tenant-1",
    serviceTakerId: "taker-1",
    status: "SIMULATED_ISSUED",
    simulationId: "sim_123",
    description: "Consulta veterinaria",
    totalAmountCents: 15000n,
    fiscalValue: false,
    externalTransmission: false,
    createdBy: "user-1",
    validatedBy: "user-1",
    validatedAt: new Date("2026-05-17T12:00:00.000Z"),
    simulatedBy: "user-1",
    simulatedAt: new Date("2026-05-17T12:10:00.000Z"),
    voidedBy: null,
    voidedAt: null,
    items: [
      {
        id: "item-1",
        tenantId: "tenant-1",
        simulatedDocumentId: "simdoc-1",
        description: "Consulta",
        serviceCode: "05.01",
        amountCents: 15000n
      }
    ],
    ...overrides
  };
}

describe("fiscal simulation API contracts", () => {
  it("returns service taker DTO without tenant scope, raw document or hash", () => {
    const dto = toFiscalServiceTakerDTO(makeTaker());

    expect(dto).toEqual({
      id: "taker-1",
      name: "Maria Tutora",
      documentMasked: "***.456.789-**",
      documentType: "CPF",
      emailMasked: "ma***@vetfiscal.local",
      status: "ACTIVE"
    });
    expect(dto).not.toHaveProperty("tenantId");
    expect(dto).not.toHaveProperty("documentHash");
    expect(JSON.stringify(dto)).not.toContain("12345678901");
  });

  it("returns simulated document DTO with explicit simulation flags and safe language", () => {
    const dto = toSimulatedFiscalDocumentDTO(makeDocument());
    const serialized = JSON.stringify(dto).toLowerCase();

    expect(dto).toMatchObject({
      status: "SIMULATED_ISSUED",
      simulationId: "sim_123",
      fiscalValue: false,
      externalTransmission: false,
      disclaimer: "SIMULACAO - SEM VALOR FISCAL - NAO TRANSMITIDO A AMBIENTE OFICIAL"
    });
    expect(dto).not.toHaveProperty("tenantId");
    expect(serialized).not.toContain("prefeitura");
    expect(serialized).not.toContain("protocolo");
    expect(serialized).not.toContain("codigo_verificacao");
    expect(serialized).not.toContain("chave_acesso");
    expect(serialized).not.toContain("danfse");
  });

  it("rejects unknown request fields and requires idempotency shape for document creation", () => {
    expect(() => createFiscalServiceTakerRequestSchema.parse({
      name: "Maria",
      document: "12345678901",
      tenantId: "client-controlled"
    })).toThrow();

    expect(() => createSimulatedFiscalDocumentRequestSchema.parse({
      serviceTakerId: "11111111-1111-4111-8111-111111111111",
      description: "Consulta",
      idempotencyKey: "short",
      items: [{ description: "Consulta", serviceCode: "05.01", amountCents: "15000" }]
    })).toThrow();

    const parsed = createSimulatedFiscalDocumentRequestSchema.parse({
      serviceTakerId: "11111111-1111-4111-8111-111111111111",
      description: "Consulta",
      idempotencyKey: "simulation-contract-key-001",
      items: [{ description: "Consulta", serviceCode: "05.01", amountCents: "15000" }]
    });

    expect(parsed.items[0]?.amountCents).toBe(15000n);
  });
});
