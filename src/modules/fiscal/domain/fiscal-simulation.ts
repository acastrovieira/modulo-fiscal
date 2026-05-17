import { createHash } from "node:crypto";
import { InvalidStateError, ValidationError } from "@/shared/errors/application-error";

export type FiscalSimulationProfileStatus = "DRAFT" | "CONFIGURED" | "BLOCKED";
export type FiscalServiceTakerStatus = "ACTIVE" | "INACTIVE";
export type FiscalServiceTakerDocumentType = "CPF" | "CNPJ" | "UNKNOWN";
export type SimulatedFiscalDocumentStatus = "DRAFT" | "VALIDATED" | "SIMULATED_ISSUED" | "VOIDED";

export type FiscalSimulationProfile = {
  id: string;
  tenantId: string;
  status: FiscalSimulationProfileStatus;
  municipalityCode: string;
  taxRegime: string;
  serviceDefaultCode: string;
  simulationMode: boolean;
};

export type FiscalServiceTaker = {
  id: string;
  tenantId: string;
  name: string;
  documentMasked: string;
  documentHash: string;
  documentType: FiscalServiceTakerDocumentType;
  emailMasked: string | null;
  status: FiscalServiceTakerStatus;
};

export type SimulatedFiscalDocumentItem = {
  id: string;
  tenantId: string;
  simulatedDocumentId: string;
  description: string;
  serviceCode: string;
  amountCents: bigint;
};

export type SimulatedFiscalDocument = {
  id: string;
  tenantId: string;
  serviceTakerId: string;
  status: SimulatedFiscalDocumentStatus;
  simulationId: string;
  description: string;
  totalAmountCents: bigint;
  fiscalValue: boolean;
  externalTransmission: boolean;
  createdBy: string | null;
  validatedBy: string | null;
  validatedAt: Date | null;
  simulatedBy: string | null;
  simulatedAt: Date | null;
  voidedBy: string | null;
  voidedAt: Date | null;
  items?: SimulatedFiscalDocumentItem[];
};

export function assertSimulationOnly(document: Pick<SimulatedFiscalDocument, "fiscalValue" | "externalTransmission" | "simulationId">): void {
  if (document.fiscalValue || document.externalTransmission || !document.simulationId.startsWith("sim_")) {
    throw new InvalidStateError("Fiscal document must remain simulation-only.");
  }
}

export function canValidateSimulatedDocument(status: SimulatedFiscalDocumentStatus): boolean {
  return status === "DRAFT";
}

export function canSimulateIssueDocument(status: SimulatedFiscalDocumentStatus): boolean {
  return status === "VALIDATED";
}

export function canVoidSimulatedDocument(status: SimulatedFiscalDocumentStatus): boolean {
  return status === "DRAFT" || status === "VALIDATED";
}

export function normalizeFiscalRegistration(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function inferDocumentType(value: string): FiscalServiceTakerDocumentType {
  const normalized = normalizeFiscalRegistration(value);
  if (/^\d{11}$/.test(normalized)) return "CPF";
  if (/^[A-Z0-9]{14}$/.test(normalized)) return "CNPJ";
  return "UNKNOWN";
}

export function maskFiscalRegistration(value: string): string {
  const normalized = normalizeFiscalRegistration(value);
  if (/^\d{11}$/.test(normalized)) {
    return `***.${normalized.slice(3, 6)}.${normalized.slice(6, 9)}-**`;
  }
  if (/^[A-Z0-9]{14}$/.test(normalized)) {
    return `${normalized.slice(0, 2)}.***.***/****-${normalized.slice(-2)}`;
  }
  return "***";
}

export function hashFiscalRegistration(tenantId: string, value: string): string {
  const normalized = normalizeFiscalRegistration(value);
  return createHash("sha256").update(`${tenantId}:${normalized}`).digest("hex");
}

export function maskEmail(value: string | null | undefined): string | null {
  if (!value) return null;
  const [local, domain] = value.trim().toLowerCase().split("@");
  if (!local || !domain) return null;
  return `${local.slice(0, 2)}***@${domain}`;
}

export function assertConfiguredProfile(profile: FiscalSimulationProfile | null): asserts profile is FiscalSimulationProfile {
  if (!profile || profile.status !== "CONFIGURED" || !profile.simulationMode) {
    throw new InvalidStateError("Fiscal simulation profile must be configured.");
  }
}

export function assertPositiveAmount(value: bigint): void {
  if (value <= 0n) {
    throw new ValidationError("Simulated fiscal item amount must be positive.");
  }
}

export function createSimulationId(tenantId: string, idempotencyKey: string): string {
  const digest = createHash("sha256").update(`${tenantId}:${idempotencyKey}`).digest("hex").slice(0, 24);
  return `sim_${digest}`;
}

export function createRequestHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
