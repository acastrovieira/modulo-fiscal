export type ImportJobStatus = "PENDING" | "VALIDATING" | "READY_FOR_REVIEW" | "REJECTED";

export type ImportJob = {
  id: string;
  tenantId: string;
  status: ImportJobStatus;
  sourceType: "SPREADSHEET" | "DOCUMENT";
};
