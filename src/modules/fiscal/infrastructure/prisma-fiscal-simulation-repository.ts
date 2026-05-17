import type {
  FiscalSimulationIdempotencyRecord,
  FiscalSimulationRepository
} from "@/modules/fiscal/application/fiscal-simulation-service";
import type {
  FiscalServiceTaker,
  FiscalSimulationProfile,
  SimulatedFiscalDocument,
  SimulatedFiscalDocumentItem,
  SimulatedFiscalDocumentStatus
} from "@/modules/fiscal/domain/fiscal-simulation";
import { prisma } from "@/shared/database/prisma";

type ProfileRow = NonNullable<Awaited<ReturnType<typeof prisma.fiscalSimulationProfile.findUnique>>>;
type TakerRow = NonNullable<Awaited<ReturnType<typeof prisma.fiscalServiceTaker.findFirst>>>;
type DocumentRow = NonNullable<Awaited<ReturnType<typeof prisma.simulatedFiscalDocument.findFirst>>>;
type ItemRow = NonNullable<Awaited<ReturnType<typeof prisma.simulatedFiscalDocumentItem.findFirst>>>;
type DocumentWithItems = DocumentRow & { items?: ItemRow[] };
type IdempotencyRow = NonNullable<Awaited<ReturnType<typeof prisma.fiscalSimulationIdempotencyRecord.findFirst>>>;

function profileRecord(row: ProfileRow): FiscalSimulationProfile {
  return {
    id: row.id,
    tenantId: row.tenantId,
    status: row.status,
    municipalityCode: row.municipalityCode,
    taxRegime: row.taxRegime,
    serviceDefaultCode: row.serviceDefaultCode,
    simulationMode: row.simulationMode
  };
}

function takerRecord(row: TakerRow): FiscalServiceTaker {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    documentMasked: row.documentMasked,
    documentHash: row.documentHash,
    documentType: row.documentType,
    emailMasked: row.emailMasked,
    status: row.status
  };
}

function itemRecord(row: ItemRow): SimulatedFiscalDocumentItem {
  return {
    id: row.id,
    tenantId: row.tenantId,
    simulatedDocumentId: row.simulatedDocumentId,
    description: row.description,
    serviceCode: row.serviceCode,
    amountCents: row.amountCents
  };
}

function documentRecord(row: DocumentWithItems): SimulatedFiscalDocument {
  return {
    id: row.id,
    tenantId: row.tenantId,
    serviceTakerId: row.serviceTakerId,
    status: row.status,
    simulationId: row.simulationId,
    description: row.description,
    totalAmountCents: row.totalAmountCents,
    fiscalValue: row.fiscalValue,
    externalTransmission: row.externalTransmission,
    createdBy: row.createdBy,
    validatedBy: row.validatedBy,
    validatedAt: row.validatedAt,
    simulatedBy: row.simulatedBy,
    simulatedAt: row.simulatedAt,
    voidedBy: row.voidedBy,
    voidedAt: row.voidedAt,
    items: row.items?.map(itemRecord)
  };
}

function idempotencyRecord(row: IdempotencyRow): FiscalSimulationIdempotencyRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    operation: row.operation,
    idempotencyKey: row.idempotencyKey,
    requestHash: row.requestHash,
    simulatedDocumentId: row.simulatedDocumentId
  };
}

export function createPrismaFiscalSimulationRepository(): FiscalSimulationRepository {
  return {
    async upsertProfile(input) {
      const row = await prisma.fiscalSimulationProfile.upsert({
        where: { tenantId: input.tenantId },
        update: {
          municipalityCode: input.municipalityCode,
          taxRegime: input.taxRegime,
          serviceDefaultCode: input.serviceDefaultCode,
          status: input.status,
          simulationMode: input.simulationMode
        },
        create: input
      });
      return profileRecord(row);
    },

    async findProfileByTenantId(tenantId) {
      const row = await prisma.fiscalSimulationProfile.findUnique({ where: { tenantId } });
      return row ? profileRecord(row) : null;
    },

    async findServiceTakerByDocumentHash(tenantId, documentHash) {
      const row = await prisma.fiscalServiceTaker.findUnique({ where: { tenantId_documentHash: { tenantId, documentHash } } });
      return row ? takerRecord(row) : null;
    },

    async createServiceTaker(input) {
      const row = await prisma.fiscalServiceTaker.create({ data: input });
      return takerRecord(row);
    },

    async findServiceTakerById(id) {
      const row = await prisma.fiscalServiceTaker.findUnique({ where: { id } });
      return row ? takerRecord(row) : null;
    },

    async findSimulatedDocumentById(id) {
      const row = await prisma.simulatedFiscalDocument.findUnique({ where: { id }, include: { items: true } });
      return row ? documentRecord(row) : null;
    },

    async findIdempotencyRecord(input) {
      const row = await prisma.fiscalSimulationIdempotencyRecord.findUnique({
        where: { tenantId_operation_idempotencyKey: input }
      });
      return row ? idempotencyRecord(row) : null;
    },

    async createSimulatedDocument(input) {
      const row = await prisma.$transaction(async (tx) => {
        const document = await tx.simulatedFiscalDocument.create({
          data: {
            tenantId: input.tenantId,
            serviceTakerId: input.serviceTakerId,
            simulationId: input.simulationId,
            description: input.description,
            totalAmountCents: input.totalAmountCents,
            fiscalValue: false,
            externalTransmission: false,
            createdBy: input.createdBy,
            status: "DRAFT",
            items: { create: input.items }
          },
          include: { items: true }
        });

        await tx.fiscalSimulationIdempotencyRecord.create({
          data: {
            tenantId: input.tenantId,
            operation: input.idempotency.operation,
            idempotencyKey: input.idempotency.idempotencyKey,
            requestHash: input.idempotency.requestHash,
            simulatedDocumentId: document.id
          }
        });

        return document;
      });

      return documentRecord(row);
    },

    async updateSimulatedDocumentStatus(input) {
      const data: {
        status: SimulatedFiscalDocumentStatus;
        validatedBy?: string;
        validatedAt?: Date;
        simulatedBy?: string;
        simulatedAt?: Date;
        voidedBy?: string;
        voidedAt?: Date;
      } = { status: input.status };

      if (input.status === "VALIDATED") {
        data.validatedBy = input.actorId;
        data.validatedAt = input.now;
      }
      if (input.status === "SIMULATED_ISSUED") {
        data.simulatedBy = input.actorId;
        data.simulatedAt = input.now;
      }
      if (input.status === "VOIDED") {
        data.voidedBy = input.actorId;
        data.voidedAt = input.now;
      }

      const row = await prisma.simulatedFiscalDocument.update({
        where: { id_tenantId: { id: input.id, tenantId: input.tenantId } },
        data,
        include: { items: true }
      });
      return documentRecord(row);
    }
  };
}
