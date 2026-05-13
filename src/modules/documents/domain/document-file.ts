export type DocumentFile = {
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
};
