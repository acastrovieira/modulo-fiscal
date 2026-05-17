import { z } from "zod";
import type { FiscalServiceTaker, FiscalSimulationProfile, SimulatedFiscalDocument } from "@/modules/fiscal/domain/fiscal-simulation";

const amountCentsSchema = z.union([z.number().int(), z.string().regex(/^\d+$/)]).transform((value) => BigInt(value));

export const upsertFiscalSimulationProfileRequestSchema = z.object({
  municipalityCode: z.string().trim().min(2).max(20),
  taxRegime: z.string().trim().min(2).max(80),
  serviceDefaultCode: z.string().trim().min(2).max(40)
}).strict();

export const createFiscalServiceTakerRequestSchema = z.object({
  name: z.string().trim().min(2).max(160),
  document: z.string().trim().min(3).max(32),
  email: z.string().email().max(254).optional().nullable()
}).strict();

export const createSimulatedFiscalDocumentRequestSchema = z.object({
  serviceTakerId: z.string().uuid(),
  description: z.string().trim().min(2).max(500),
  idempotencyKey: z.string().trim().regex(/^[A-Za-z0-9_-]{16,120}$/).optional(),
  items: z.array(z.object({
    description: z.string().trim().min(2).max(300),
    serviceCode: z.string().trim().min(2).max(40),
    amountCents: amountCentsSchema
  }).strict()).min(1).max(50)
}).strict();

export function toFiscalSimulationProfileDTO(profile: FiscalSimulationProfile) {
  return {
    id: profile.id,
    status: profile.status,
    municipalityCode: profile.municipalityCode,
    taxRegime: profile.taxRegime,
    serviceDefaultCode: profile.serviceDefaultCode,
    simulationMode: profile.simulationMode
  };
}

export function toFiscalServiceTakerDTO(taker: FiscalServiceTaker) {
  return {
    id: taker.id,
    name: taker.name,
    documentMasked: taker.documentMasked,
    documentType: taker.documentType,
    emailMasked: taker.emailMasked,
    status: taker.status
  };
}

export function toSimulatedFiscalDocumentDTO(document: SimulatedFiscalDocument) {
  return {
    id: document.id,
    serviceTakerId: document.serviceTakerId,
    status: document.status,
    simulationId: document.simulationId,
    description: document.description,
    totalAmountCents: document.totalAmountCents.toString(),
    fiscalValue: document.fiscalValue,
    externalTransmission: document.externalTransmission,
    createdBy: document.createdBy,
    validatedBy: document.validatedBy,
    validatedAt: document.validatedAt,
    simulatedBy: document.simulatedBy,
    simulatedAt: document.simulatedAt,
    voidedBy: document.voidedBy,
    voidedAt: document.voidedAt,
    disclaimer: "SIMULACAO - SEM VALOR FISCAL - NAO TRANSMITIDO A AMBIENTE OFICIAL",
    items: document.items?.map((item) => ({
      id: item.id,
      description: item.description,
      serviceCode: item.serviceCode,
      amountCents: item.amountCents.toString()
    })) ?? []
  };
}
