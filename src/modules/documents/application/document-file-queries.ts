import type { AuditRecorder } from "@/modules/audit/application/audit-service";
import { assertCommandPermission, createCommandAuditEvent, type CommandContext } from "@/shared/application/command-context";
import { NotFoundError } from "@/shared/errors/application-error";
import { previewChecksum } from "@/shared/security/redaction";
import { assertTenantScope } from "@/shared/security/tenant-scope";

export type DocumentFileFilters = {
  fileType?: string;
  mimeType?: string;
  createdBy?: string;
  createdFrom?: Date;
  createdTo?: Date;
  page?: number;
  pageSize?: number;
};

export type DocumentFileRecord = {
  id: string;
  tenantId: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  storagePath: string;
  checksumSha256: string;
  sizeBytes: bigint;
  createdBy: string | null;
  createdAt: Date;
  linkedImportBatchesCount?: number;
  linkedFiscalCandidatesCount?: number;
};

export type DocumentFileListItemDTO = {
  id: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  checksumSha256Preview: string;
  sizeBytes: string;
  createdBy: string | null;
  createdAt: string;
};

export type DocumentFileDetailDTO = DocumentFileListItemDTO & {
  linkedImportBatchesCount: number;
  linkedFiscalCandidatesCount: number;
  storageAvailable: false;
};

export type DocumentDownloadIntentDTO = {
  documentId: string;
  status: "DOWNLOAD_NOT_AVAILABLE_IN_MVP";
  storageAvailable: false;
  externalStorageCalled: false;
  signedUrlGenerated: false;
};

export type DocumentFileQueryRepository = {
  listDocumentFiles(input: { tenantId: string; filters: DocumentFileFilters }): Promise<DocumentFileRecord[]>;
  findDocumentFile(input: { tenantId: string; id: string }): Promise<DocumentFileRecord | null>;
};

export function toDocumentFileListItemDTO(record: DocumentFileRecord): DocumentFileListItemDTO {
  return {
    id: record.id,
    fileName: record.fileName,
    fileType: record.fileType,
    mimeType: record.mimeType,
    checksumSha256Preview: previewChecksum(record.checksumSha256),
    sizeBytes: record.sizeBytes.toString(),
    createdBy: record.createdBy,
    createdAt: record.createdAt.toISOString()
  };
}

function toDocumentFileDetailDTO(record: DocumentFileRecord): DocumentFileDetailDTO {
  return {
    ...toDocumentFileListItemDTO(record),
    linkedImportBatchesCount: record.linkedImportBatchesCount ?? 0,
    linkedFiscalCandidatesCount: record.linkedFiscalCandidatesCount ?? 0,
    storageAvailable: false
  };
}

export async function listDocumentFiles(input: {
  context: CommandContext;
  repository: DocumentFileQueryRepository;
  filters?: DocumentFileFilters;
}): Promise<DocumentFileListItemDTO[]> {
  assertCommandPermission(input.context, "documents.download");

  const records = await input.repository.listDocumentFiles({ tenantId: input.context.tenantId, filters: input.filters ?? {} });
  return records.map((record) => {
    assertTenantScope(input.context.tenantId, record);
    return toDocumentFileListItemDTO(record);
  });
}

export async function getDocumentFile(input: {
  context: CommandContext;
  repository: DocumentFileQueryRepository;
  documentFileId: string;
}): Promise<DocumentFileDetailDTO> {
  assertCommandPermission(input.context, "documents.download");

  const record = await input.repository.findDocumentFile({ tenantId: input.context.tenantId, id: input.documentFileId });
  if (!record) throw new NotFoundError("Document file not found.");

  assertTenantScope(input.context.tenantId, record);
  return toDocumentFileDetailDTO(record);
}

export async function recordDocumentDownloadIntent(input: {
  context: CommandContext;
  repository: DocumentFileQueryRepository;
  audit: AuditRecorder;
  documentFileId: string;
}): Promise<DocumentDownloadIntentDTO> {
  assertCommandPermission(input.context, "documents.download");

  const record = await input.repository.findDocumentFile({ tenantId: input.context.tenantId, id: input.documentFileId });
  if (!record) throw new NotFoundError("Document file not found.");
  assertTenantScope(input.context.tenantId, record);

  const result: DocumentDownloadIntentDTO = {
    documentId: record.id,
    status: "DOWNLOAD_NOT_AVAILABLE_IN_MVP",
    storageAvailable: false,
    externalStorageCalled: false,
    signedUrlGenerated: false
  };

  await input.audit.record(
    createCommandAuditEvent(input.context, {
      eventType: "documents.download_intent_recorded",
      entityType: "DocumentFile",
      entityId: record.id,
      metadata: {
        fileType: record.fileType,
        mimeType: record.mimeType,
        storageAvailable: false,
        externalStorageCalled: false,
        signedUrlGenerated: false
      }
    })
  );

  return result;
}
