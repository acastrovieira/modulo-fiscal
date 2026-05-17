import type { AuditRecorder } from "@/modules/audit/application/audit-service";
import {
  assertConfiguredProfile,
  assertPositiveAmount,
  assertSimulationOnly,
  canSimulateIssueDocument,
  canValidateSimulatedDocument,
  canVoidSimulatedDocument,
  createRequestHash,
  createSimulationId,
  hashFiscalRegistration,
  inferDocumentType,
  maskEmail,
  maskFiscalRegistration,
  type FiscalServiceTaker,
  type FiscalSimulationProfile,
  type SimulatedFiscalDocument,
  type SimulatedFiscalDocumentStatus
} from "@/modules/fiscal/domain/fiscal-simulation";
import { assertPermissionForCommand, createCommandAuditEvent, type CommandContext } from "@/shared/application/command-context";
import { InvalidStateError, NotFoundError, ValidationError } from "@/shared/errors/application-error";
import { assertTenantScope } from "@/shared/security/tenant-scope";

const fiscalSimulationAuditMetadata = {
  simulatedOnly: true,
  fiscalValue: false,
  externalProviderCalled: false,
  externalTransmission: false,
  nfseIssued: false
} as const;

export type FiscalSimulationIdempotencyRecord = {
  id: string;
  tenantId: string;
  operation: string;
  idempotencyKey: string;
  requestHash: string;
  simulatedDocumentId: string;
};

export type FiscalSimulationRepository = {
  upsertProfile(input: {
    tenantId: string;
    municipalityCode: string;
    taxRegime: string;
    serviceDefaultCode: string;
    status: "CONFIGURED";
    simulationMode: true;
  }): Promise<FiscalSimulationProfile>;
  findProfileByTenantId(tenantId: string): Promise<FiscalSimulationProfile | null>;
  findServiceTakerByDocumentHash(tenantId: string, documentHash: string): Promise<FiscalServiceTaker | null>;
  createServiceTaker(input: {
    tenantId: string;
    name: string;
    documentMasked: string;
    documentHash: string;
    documentType: "CPF" | "CNPJ" | "UNKNOWN";
    emailMasked: string | null;
    status: "ACTIVE";
  }): Promise<FiscalServiceTaker>;
  findServiceTakerById(id: string): Promise<FiscalServiceTaker | null>;
  findSimulatedDocumentById(id: string): Promise<SimulatedFiscalDocument | null>;
  findIdempotencyRecord(input: { tenantId: string; operation: string; idempotencyKey: string }): Promise<FiscalSimulationIdempotencyRecord | null>;
  createSimulatedDocument(input: {
    tenantId: string;
    serviceTakerId: string;
    simulationId: string;
    description: string;
    totalAmountCents: bigint;
    createdBy: string;
    items: Array<{ tenantId: string; description: string; serviceCode: string; amountCents: bigint }>;
    idempotency: { operation: string; idempotencyKey: string; requestHash: string };
  }): Promise<SimulatedFiscalDocument>;
  updateSimulatedDocumentStatus(input: {
    id: string;
    tenantId: string;
    status: SimulatedFiscalDocumentStatus;
    actorId: string;
    now: Date;
  }): Promise<SimulatedFiscalDocument>;
};

export type UpsertFiscalSimulationProfileInput = {
  context: CommandContext;
  municipalityCode: string;
  taxRegime: string;
  serviceDefaultCode: string;
};

export type CreateFiscalServiceTakerInput = {
  context: CommandContext;
  name: string;
  document: string;
  email?: string | null;
};

export type CreateSimulatedFiscalDocumentInput = {
  context: CommandContext;
  serviceTakerId: string;
  description: string;
  idempotencyKey: string;
  items: Array<{ description: string; serviceCode: string; amountCents: bigint }>;
};

export type SimulatedFiscalDocumentTransitionInput = {
  context: CommandContext;
  documentId: string;
  now?: Date;
};

function requiredText(value: string, message: string): string {
  const trimmed = value.trim();
  if (trimmed.length < 2) {
    throw new ValidationError(message);
  }
  return trimmed;
}

function assertIdempotencyKey(value: string): string {
  const key = value.trim();
  if (!/^[A-Za-z0-9_-]{16,120}$/.test(key)) {
    throw new ValidationError("A valid idempotency key is required.");
  }
  return key;
}

function assertDocumentItems(items: CreateSimulatedFiscalDocumentInput["items"]) {
  if (items.length === 0) {
    throw new ValidationError("Simulated fiscal document requires at least one item.");
  }

  return items.map((item) => {
    const description = requiredText(item.description, "Item description is required.");
    const serviceCode = requiredText(item.serviceCode, "Service code is required.");
    assertPositiveAmount(item.amountCents);
    return { description, serviceCode, amountCents: item.amountCents };
  });
}

export function createFiscalSimulationService(dependencies: { repository: FiscalSimulationRepository; audit: AuditRecorder }) {
  const { repository, audit } = dependencies;

  return {
    async upsertProfile(input: UpsertFiscalSimulationProfileInput): Promise<FiscalSimulationProfile> {
      assertPermissionForCommand(input.context, "upsertFiscalSimulationProfile");

      const profile = await repository.upsertProfile({
        tenantId: input.context.tenantId,
        municipalityCode: requiredText(input.municipalityCode, "Municipality code is required."),
        taxRegime: requiredText(input.taxRegime, "Tax regime is required."),
        serviceDefaultCode: requiredText(input.serviceDefaultCode, "Default service code is required."),
        status: "CONFIGURED",
        simulationMode: true
      });

      await audit.record(createCommandAuditEvent(input.context, {
        eventType: "fiscal_simulation.profile_configured",
        entityType: "FiscalSimulationProfile",
        entityId: profile.id,
        afterPayload: { status: profile.status, simulationMode: profile.simulationMode },
        metadata: fiscalSimulationAuditMetadata
      }));

      return profile;
    },

    async createServiceTaker(input: CreateFiscalServiceTakerInput): Promise<FiscalServiceTaker> {
      assertPermissionForCommand(input.context, "createFiscalServiceTaker");

      const documentHash = hashFiscalRegistration(input.context.tenantId, input.document);
      const existing = await repository.findServiceTakerByDocumentHash(input.context.tenantId, documentHash);
      if (existing) {
        return existing;
      }

      const taker = await repository.createServiceTaker({
        tenantId: input.context.tenantId,
        name: requiredText(input.name, "Service taker name is required."),
        documentMasked: maskFiscalRegistration(input.document),
        documentHash,
        documentType: inferDocumentType(input.document),
        emailMasked: maskEmail(input.email),
        status: "ACTIVE"
      });

      await audit.record(createCommandAuditEvent(input.context, {
        eventType: "fiscal_simulation.service_taker_created",
        entityType: "FiscalServiceTaker",
        entityId: taker.id,
        afterPayload: { status: taker.status, documentType: taker.documentType },
        metadata: { ...fiscalSimulationAuditMetadata, documentMasked: taker.documentMasked }
      }));

      return taker;
    },

    async createSimulatedDocument(input: CreateSimulatedFiscalDocumentInput): Promise<SimulatedFiscalDocument> {
      assertPermissionForCommand(input.context, "createSimulatedFiscalDocument");
      const idempotencyKey = assertIdempotencyKey(input.idempotencyKey);
      const normalizedItems = assertDocumentItems(input.items);
      const requestHash = createRequestHash({
        serviceTakerId: input.serviceTakerId,
        description: input.description,
        items: normalizedItems.map((item) => ({ ...item, amountCents: item.amountCents.toString() }))
      });

      const replay = await repository.findIdempotencyRecord({ tenantId: input.context.tenantId, operation: "create_simulated_document", idempotencyKey });
      if (replay) {
        if (replay.requestHash !== requestHash) {
          throw new InvalidStateError("Idempotency key was already used with a different payload.");
        }
        const document = await repository.findSimulatedDocumentById(replay.simulatedDocumentId);
        if (!document) {
          throw new InvalidStateError("Idempotency replay document is missing.");
        }
        assertTenantScope(input.context.tenantId, document);
        return document;
      }

      assertConfiguredProfile(await repository.findProfileByTenantId(input.context.tenantId));
      const taker = await repository.findServiceTakerById(input.serviceTakerId);
      if (!taker) {
        throw new NotFoundError("Fiscal service taker not found.");
      }
      assertTenantScope(input.context.tenantId, taker);
      if (taker.status !== "ACTIVE") {
        throw new InvalidStateError("Fiscal service taker is not active.");
      }

      const totalAmountCents = normalizedItems.reduce((total, item) => total + item.amountCents, 0n);
      const document = await repository.createSimulatedDocument({
        tenantId: input.context.tenantId,
        serviceTakerId: taker.id,
        simulationId: createSimulationId(input.context.tenantId, idempotencyKey),
        description: requiredText(input.description, "Simulated fiscal document description is required."),
        totalAmountCents,
        createdBy: input.context.actorId,
        items: normalizedItems.map((item) => ({ ...item, tenantId: input.context.tenantId })),
        idempotency: { operation: "create_simulated_document", idempotencyKey, requestHash }
      });
      assertSimulationOnly(document);

      await audit.record(createCommandAuditEvent(input.context, {
        eventType: "fiscal_simulation.document_created",
        entityType: "SimulatedFiscalDocument",
        entityId: document.id,
        afterPayload: {
          status: document.status,
          simulationId: document.simulationId,
          totalAmountCents: document.totalAmountCents.toString(),
          fiscalValue: document.fiscalValue,
          externalTransmission: document.externalTransmission
        },
        metadata: fiscalSimulationAuditMetadata
      }));

      return document;
    },

    async validateDocument(input: SimulatedFiscalDocumentTransitionInput): Promise<SimulatedFiscalDocument> {
      assertPermissionForCommand(input.context, "validateSimulatedFiscalDocument");
      const document = await repository.findSimulatedDocumentById(input.documentId);
      if (!document) throw new NotFoundError("Simulated fiscal document not found.");
      assertTenantScope(input.context.tenantId, document);
      assertSimulationOnly(document);
      if (!canValidateSimulatedDocument(document.status)) throw new InvalidStateError(`Cannot validate simulated fiscal document from ${document.status}.`);

      const updated = await repository.updateSimulatedDocumentStatus({ id: document.id, tenantId: input.context.tenantId, status: "VALIDATED", actorId: input.context.actorId, now: input.now ?? new Date() });
      await audit.record(createCommandAuditEvent(input.context, { eventType: "fiscal_simulation.document_validated", entityType: "SimulatedFiscalDocument", entityId: updated.id, beforePayload: { status: document.status }, afterPayload: { status: updated.status }, metadata: fiscalSimulationAuditMetadata }));
      return updated;
    },

    async simulateIssueDocument(input: SimulatedFiscalDocumentTransitionInput): Promise<SimulatedFiscalDocument> {
      assertPermissionForCommand(input.context, "simulateIssueFiscalDocument");
      const document = await repository.findSimulatedDocumentById(input.documentId);
      if (!document) throw new NotFoundError("Simulated fiscal document not found.");
      assertTenantScope(input.context.tenantId, document);
      assertSimulationOnly(document);
      if (!canSimulateIssueDocument(document.status)) throw new InvalidStateError(`Cannot simulate issue from ${document.status}.`);

      const updated = await repository.updateSimulatedDocumentStatus({ id: document.id, tenantId: input.context.tenantId, status: "SIMULATED_ISSUED", actorId: input.context.actorId, now: input.now ?? new Date() });
      await audit.record(createCommandAuditEvent(input.context, { eventType: "fiscal_simulation.document_simulated_issued", entityType: "SimulatedFiscalDocument", entityId: updated.id, beforePayload: { status: document.status }, afterPayload: { status: updated.status, fiscalValue: updated.fiscalValue, externalTransmission: updated.externalTransmission }, metadata: fiscalSimulationAuditMetadata }));
      return updated;
    },

    async voidDocument(input: SimulatedFiscalDocumentTransitionInput): Promise<SimulatedFiscalDocument> {
      assertPermissionForCommand(input.context, "voidSimulatedFiscalDocument");
      const document = await repository.findSimulatedDocumentById(input.documentId);
      if (!document) throw new NotFoundError("Simulated fiscal document not found.");
      assertTenantScope(input.context.tenantId, document);
      assertSimulationOnly(document);
      if (!canVoidSimulatedDocument(document.status)) throw new InvalidStateError(`Cannot void simulated fiscal document from ${document.status}.`);

      const updated = await repository.updateSimulatedDocumentStatus({ id: document.id, tenantId: input.context.tenantId, status: "VOIDED", actorId: input.context.actorId, now: input.now ?? new Date() });
      await audit.record(createCommandAuditEvent(input.context, { eventType: "fiscal_simulation.document_voided", entityType: "SimulatedFiscalDocument", entityId: updated.id, beforePayload: { status: document.status }, afterPayload: { status: updated.status }, metadata: fiscalSimulationAuditMetadata }));
      return updated;
    }
  };
}
