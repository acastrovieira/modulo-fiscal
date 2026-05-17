import { describe, expect, it, vi } from "vitest";
import {
  createFiscalSimulationService,
  type FiscalSimulationRepository
} from "@/modules/fiscal/application/fiscal-simulation-service";
import type {
  FiscalServiceTaker,
  FiscalSimulationProfile,
  SimulatedFiscalDocument,
  SimulatedFiscalDocumentItem
} from "@/modules/fiscal/domain/fiscal-simulation";
import { ForbiddenError, InvalidStateError, TenantScopeError, ValidationError } from "@/shared/errors/application-error";
import { makeCommandContext, tenantAId, tenantBId, userAId } from "../fixtures/security";

function makeProfile(overrides: Partial<FiscalSimulationProfile> = {}): FiscalSimulationProfile {
  return {
    id: "profile-1",
    tenantId: tenantAId,
    status: "CONFIGURED",
    municipalityCode: "3550308",
    taxRegime: "simples_nacional",
    serviceDefaultCode: "05.01",
    simulationMode: true,
    ...overrides
  };
}

function makeTaker(overrides: Partial<FiscalServiceTaker> = {}): FiscalServiceTaker {
  return {
    id: "taker-1",
    tenantId: tenantAId,
    name: "Maria Tutora",
    documentMasked: "***.123.456-**",
    documentHash: "hash-1",
    documentType: "CPF",
    emailMasked: "ma***@vetfiscal.local",
    status: "ACTIVE",
    ...overrides
  };
}

function makeItem(overrides: Partial<SimulatedFiscalDocumentItem> = {}): SimulatedFiscalDocumentItem {
  return {
    id: "item-1",
    tenantId: tenantAId,
    simulatedDocumentId: "simdoc-1",
    description: "Consulta veterinaria",
    serviceCode: "05.01",
    amountCents: 15000n,
    ...overrides
  };
}

function makeDocument(overrides: Partial<SimulatedFiscalDocument> = {}): SimulatedFiscalDocument {
  return {
    id: "simdoc-1",
    tenantId: tenantAId,
    serviceTakerId: "taker-1",
    status: "DRAFT",
    simulationId: "sim_abc123",
    description: "Consulta veterinaria",
    totalAmountCents: 15000n,
    fiscalValue: false,
    externalTransmission: false,
    createdBy: userAId,
    validatedBy: null,
    validatedAt: null,
    simulatedBy: null,
    simulatedAt: null,
    voidedBy: null,
    voidedAt: null,
    items: [makeItem()],
    ...overrides
  };
}

function makeRepository(overrides: Partial<FiscalSimulationRepository> = {}): FiscalSimulationRepository {
  return {
    upsertProfile: vi.fn().mockImplementation(async (input) => makeProfile(input)),
    findProfileByTenantId: vi.fn().mockResolvedValue(makeProfile()),
    findServiceTakerByDocumentHash: vi.fn().mockResolvedValue(null),
    createServiceTaker: vi.fn().mockImplementation(async (input) => makeTaker(input)),
    findServiceTakerById: vi.fn().mockResolvedValue(makeTaker()),
    findSimulatedDocumentById: vi.fn().mockResolvedValue(makeDocument()),
    findIdempotencyRecord: vi.fn().mockResolvedValue(null),
    createSimulatedDocument: vi.fn().mockImplementation(async (input) =>
      makeDocument({
        tenantId: input.tenantId,
        serviceTakerId: input.serviceTakerId,
        simulationId: input.simulationId,
        description: input.description,
        totalAmountCents: input.totalAmountCents,
        createdBy: input.createdBy,
        items: input.items.map((item: Parameters<FiscalSimulationRepository["createSimulatedDocument"]>[0]["items"][number], index: number) =>
          makeItem({ id: `item-${index + 1}`, ...item, simulatedDocumentId: "simdoc-1" })
        )
      })
    ),
    updateSimulatedDocumentStatus: vi.fn().mockImplementation(async (input) =>
      makeDocument({
        id: input.id,
        tenantId: input.tenantId,
        status: input.status,
        validatedBy: input.status === "VALIDATED" ? input.actorId : null,
        validatedAt: input.status === "VALIDATED" ? input.now : null,
        simulatedBy: input.status === "SIMULATED_ISSUED" ? input.actorId : null,
        simulatedAt: input.status === "SIMULATED_ISSUED" ? input.now : null,
        voidedBy: input.status === "VOIDED" ? input.actorId : null,
        voidedAt: input.status === "VOIDED" ? input.now : null
      })
    ),
    ...overrides
  };
}

function makeAudit() {
  return { record: vi.fn().mockResolvedValue(undefined) };
}

describe("fiscal simulation service", () => {
  it("configures a simulation-only fiscal profile with audit", async () => {
    const audit = makeAudit();
    const service = createFiscalSimulationService({ repository: makeRepository(), audit });

    const profile = await service.upsertProfile({
      context: makeCommandContext("FISCAL_MANAGER"),
      municipalityCode: "3550308",
      taxRegime: "simples_nacional",
      serviceDefaultCode: "05.01"
    });

    expect(profile).toMatchObject({ status: "CONFIGURED", simulationMode: true });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "fiscal_simulation.profile_configured" }));
  });

  it("creates service taker with masked document and no raw PII in audit", async () => {
    const audit = makeAudit();
    const service = createFiscalSimulationService({ repository: makeRepository(), audit });

    const taker = await service.createServiceTaker({
      context: makeCommandContext("FISCAL_OPERATOR"),
      name: "Maria Tutora",
      document: "123.456.789-01",
      email: "maria@vetfiscal.local"
    });

    expect(taker.documentMasked).toBe("***.456.789-**");
    expect(taker.documentType).toBe("CPF");
    expect(JSON.stringify(audit.record.mock.calls)).not.toContain("12345678901");
  });

  it("creates a simulated document with idempotency, audit and simulation-only flags", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const service = createFiscalSimulationService({ repository, audit });

    const document = await service.createSimulatedDocument({
      context: makeCommandContext("FISCAL_OPERATOR"),
      serviceTakerId: "taker-1",
      description: "Consulta veterinaria",
      idempotencyKey: "simulation-key-0001",
      items: [{ description: "Consulta", serviceCode: "05.01", amountCents: 15000n }]
    });

    expect(document).toMatchObject({ status: "DRAFT", fiscalValue: false, externalTransmission: false });
    expect(document.simulationId).toMatch(/^sim_/);
    expect(repository.createSimulatedDocument).toHaveBeenCalledWith(expect.objectContaining({
      tenantId: tenantAId,
      idempotency: expect.objectContaining({ operation: "create_simulated_document", idempotencyKey: "simulation-key-0001" })
    }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ eventType: "fiscal_simulation.document_created" }));
  });

  it("replays same idempotency key only when payload hash matches", async () => {
    const repository = makeRepository({
      findIdempotencyRecord: vi.fn().mockResolvedValue({
        id: "idem-1",
        tenantId: tenantAId,
        operation: "create_simulated_document",
        idempotencyKey: "simulation-key-0002",
        requestHash: "different",
        simulatedDocumentId: "simdoc-1"
      })
    });
    const service = createFiscalSimulationService({ repository, audit: makeAudit() });

    await expect(service.createSimulatedDocument({
      context: makeCommandContext("FISCAL_OPERATOR"),
      serviceTakerId: "taker-1",
      description: "Consulta veterinaria",
      idempotencyKey: "simulation-key-0002",
      items: [{ description: "Consulta", serviceCode: "05.01", amountCents: 15000n }]
    })).rejects.toBeInstanceOf(InvalidStateError);
  });

  it("validates and simulates issue only through allowed state transitions", async () => {
    const repository = makeRepository();
    const audit = makeAudit();
    const service = createFiscalSimulationService({ repository, audit });
    const now = new Date("2026-05-17T12:00:00.000Z");

    await expect(service.validateDocument({ context: makeCommandContext("FISCAL_OPERATOR"), documentId: "simdoc-1", now }))
      .resolves.toMatchObject({ status: "VALIDATED", validatedBy: userAId, validatedAt: now });

    const issueService = createFiscalSimulationService({
      repository: makeRepository({ findSimulatedDocumentById: vi.fn().mockResolvedValue(makeDocument({ status: "VALIDATED" })) }),
      audit
    });
    await expect(issueService.simulateIssueDocument({ context: makeCommandContext("FISCAL_MANAGER"), documentId: "simdoc-1", now }))
      .resolves.toMatchObject({ status: "SIMULATED_ISSUED", simulatedBy: userAId });
  });

  it("blocks invalid role, missing profile, cross-tenant taker and non-positive amount", async () => {
    const service = createFiscalSimulationService({ repository: makeRepository(), audit: makeAudit() });
    await expect(service.upsertProfile({ context: makeCommandContext("AUDITOR"), municipalityCode: "3550308", taxRegime: "simples", serviceDefaultCode: "05.01" })).rejects.toBeInstanceOf(ForbiddenError);

    const missingProfile = createFiscalSimulationService({ repository: makeRepository({ findProfileByTenantId: vi.fn().mockResolvedValue(null) }), audit: makeAudit() });
    await expect(missingProfile.createSimulatedDocument({ context: makeCommandContext("FISCAL_OPERATOR"), serviceTakerId: "taker-1", description: "Consulta", idempotencyKey: "simulation-key-0003", items: [{ description: "Consulta", serviceCode: "05.01", amountCents: 15000n }] })).rejects.toBeInstanceOf(InvalidStateError);

    const crossTenant = createFiscalSimulationService({ repository: makeRepository({ findServiceTakerById: vi.fn().mockResolvedValue(makeTaker({ tenantId: tenantBId })) }), audit: makeAudit() });
    await expect(crossTenant.createSimulatedDocument({ context: makeCommandContext("FISCAL_OPERATOR"), serviceTakerId: "taker-1", description: "Consulta", idempotencyKey: "simulation-key-0004", items: [{ description: "Consulta", serviceCode: "05.01", amountCents: 15000n }] })).rejects.toBeInstanceOf(TenantScopeError);

    await expect(service.createSimulatedDocument({ context: makeCommandContext("FISCAL_OPERATOR"), serviceTakerId: "taker-1", description: "Consulta", idempotencyKey: "simulation-key-0005", items: [{ description: "Consulta", serviceCode: "05.01", amountCents: 0n }] })).rejects.toBeInstanceOf(ValidationError);
  });
});
