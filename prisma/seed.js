const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const ids = {
  tenant: "11111111-1111-4111-8111-111111111111",
  owner: "00000000-0000-4000-8000-000000000001",
  fiscalManager: "00000000-0000-4000-8000-000000000002",
  fiscalOperator: "00000000-0000-4000-8000-000000000003",
  accountant: "00000000-0000-4000-8000-000000000004",
  auditor: "00000000-0000-4000-8000-000000000005",
  ownerMembership: "10000000-0000-4000-8000-000000000001",
  managerMembership: "10000000-0000-4000-8000-000000000002",
  operatorMembership: "10000000-0000-4000-8000-000000000003",
  accountantMembership: "10000000-0000-4000-8000-000000000004",
  auditorMembership: "10000000-0000-4000-8000-000000000005",
  document: "20000000-0000-4000-8000-000000000001",
  importBatch: "30000000-0000-4000-8000-000000000001",
  rowReview: "31000000-0000-4000-8000-000000000001",
  rowReady: "31000000-0000-4000-8000-000000000002",
  rowBlocked: "31000000-0000-4000-8000-000000000003",
  rowSimulated: "31000000-0000-4000-8000-000000000004",
  rowApproved: "31000000-0000-4000-8000-000000000005",
  candidateReview: "40000000-0000-4000-8000-000000000001",
  candidateReady: "40000000-0000-4000-8000-000000000002",
  candidateBlocked: "40000000-0000-4000-8000-000000000003",
  candidateSimulated: "40000000-0000-4000-8000-000000000004",
  candidateApproved: "40000000-0000-4000-8000-000000000005",
  inconsistencyBlocking: "50000000-0000-4000-8000-000000000001",
  inconsistencyReviewable: "50000000-0000-4000-8000-000000000002",
  batchReview: "60000000-0000-4000-8000-000000000001",
  batchApproved: "60000000-0000-4000-8000-000000000002",
  batchReviewItem: "61000000-0000-4000-8000-000000000001",
  batchApprovedItem: "61000000-0000-4000-8000-000000000002",
  auditImport: "70000000-0000-4000-8000-000000000001",
  auditCandidate: "70000000-0000-4000-8000-000000000002",
  auditInconsistency: "70000000-0000-4000-8000-000000000003",
  auditBatchSimulated: "70000000-0000-4000-8000-000000000004",
  auditBatchApproved: "70000000-0000-4000-8000-000000000005"
};

const demoProfiles = [
  { id: ids.owner, email: "owner@vetfiscal.local", name: "Operador VetFiscal", role: "OWNER", membershipId: ids.ownerMembership },
  { id: ids.fiscalManager, email: "fiscal.manager@vetfiscal.local", name: "Gestora Fiscal Demo", role: "FISCAL_MANAGER", membershipId: ids.managerMembership },
  { id: ids.fiscalOperator, email: "fiscal.operator@vetfiscal.local", name: "Operadora Fiscal Demo", role: "FISCAL_OPERATOR", membershipId: ids.operatorMembership },
  { id: ids.accountant, email: "accountant@vetfiscal.local", name: "Contabilidade Demo", role: "ACCOUNTANT", membershipId: ids.accountantMembership },
  { id: ids.auditor, email: "auditor@vetfiscal.local", name: "Auditoria Demo", role: "AUDITOR", membershipId: ids.auditorMembership }
];

const normalizedRows = [
  {
    id: ids.rowReview,
    rowNumber: 1,
    sourceRowId: "demo-001",
    customerName: "Tutora Demo Aurora",
    customerDocumentMasked: "*******0001",
    serviceDescription: "Consulta veterinaria de rotina",
    grossAmountCents: 18000n,
    status: "NEEDS_REVIEW",
    candidateId: ids.candidateReview,
    fingerprint: "demo-fingerprint-review"
  },
  {
    id: ids.rowReady,
    rowNumber: 2,
    sourceRowId: "demo-002",
    customerName: "Tutor Demo Bento",
    customerDocumentMasked: "*******0002",
    serviceDescription: "Vacina polivalente",
    grossAmountCents: 9500n,
    status: "READY_FOR_BATCH",
    candidateId: ids.candidateReady,
    fingerprint: "demo-fingerprint-ready"
  },
  {
    id: ids.rowBlocked,
    rowNumber: 3,
    sourceRowId: "demo-003",
    customerName: "Tutora Demo Clara",
    customerDocumentMasked: "*******0003",
    serviceDescription: "Exame laboratorial com dado pendente",
    grossAmountCents: 22000n,
    status: "BLOCKED",
    candidateId: ids.candidateBlocked,
    fingerprint: "demo-fingerprint-blocked"
  },
  {
    id: ids.rowSimulated,
    rowNumber: 4,
    sourceRowId: "demo-004",
    customerName: "Tutor Demo Davi",
    customerDocumentMasked: "*******0004",
    serviceDescription: "Retorno clinico supervisionado",
    grossAmountCents: 12000n,
    status: "SIMULATED",
    candidateId: ids.candidateSimulated,
    fingerprint: "demo-fingerprint-simulated"
  },
  {
    id: ids.rowApproved,
    rowNumber: 5,
    sourceRowId: "demo-005",
    customerName: "Tutora Demo Elisa",
    customerDocumentMasked: "*******0005",
    serviceDescription: "Procedimento ambulatorial simples",
    grossAmountCents: 30000n,
    status: "APPROVED_FOR_FUTURE_ISSUANCE",
    candidateId: ids.candidateApproved,
    fingerprint: "demo-fingerprint-approved"
  }
];

function normalizedPayload(row) {
  return {
    sourceRowId: row.sourceRowId,
    customerName: row.customerName,
    customerDocumentMasked: row.customerDocumentMasked,
    serviceDate: "2026-05-13",
    competenceDate: "2026-05-01",
    serviceDescription: row.serviceDescription,
    grossAmountCents: row.grossAmountCents.toString()
  };
}

async function upsertProfiles() {
  await prisma.tenant.upsert({
    where: { id: ids.tenant },
    update: {
      name: "Clinica VetFiscal Demo",
      legalName: "Clinica VetFiscal Demo LTDA",
      cnpj: null,
      status: "ACTIVE"
    },
    create: {
      id: ids.tenant,
      name: "Clinica VetFiscal Demo",
      legalName: "Clinica VetFiscal Demo LTDA",
      cnpj: null,
      status: "ACTIVE"
    }
  });

  for (const profile of demoProfiles) {
    await prisma.profile.upsert({
      where: { id: profile.id },
      update: { email: profile.email, name: profile.name, status: "ACTIVE" },
      create: { id: profile.id, email: profile.email, name: profile.name, status: "ACTIVE" }
    });

    await prisma.tenantMembership.upsert({
      where: { tenantId_userId: { tenantId: ids.tenant, userId: profile.id } },
      update: { role: profile.role, status: "ACTIVE" },
      create: {
        id: profile.membershipId,
        tenantId: ids.tenant,
        userId: profile.id,
        role: profile.role,
        status: "ACTIVE"
      }
    });
  }
}

async function upsertImportData() {
  await prisma.documentFile.upsert({
    where: { id: ids.document },
    update: {
      tenantId: ids.tenant,
      fileName: "agenda-demo.csv",
      fileType: "csv",
      mimeType: "text/csv",
      storagePath: "demo/tenant-a/imports/agenda-demo.csv",
      checksumSha256: "demo-checksum-sha256-0001",
      sizeBytes: 2048n,
      createdBy: ids.fiscalOperator
    },
    create: {
      id: ids.document,
      tenantId: ids.tenant,
      fileName: "agenda-demo.csv",
      fileType: "csv",
      mimeType: "text/csv",
      storagePath: "demo/tenant-a/imports/agenda-demo.csv",
      checksumSha256: "demo-checksum-sha256-0001",
      sizeBytes: 2048n,
      createdBy: ids.fiscalOperator
    }
  });

  await prisma.importBatch.upsert({
    where: { id: ids.importBatch },
    update: {
      tenantId: ids.tenant,
      documentFileId: ids.document,
      createdBy: ids.fiscalOperator,
      status: "READY_FOR_REVIEW",
      sourceType: "structured_file",
      sourceName: "agenda-demo.csv",
      idempotencyKey: "demo-import-agenda-2026-05",
      totalRows: normalizedRows.length,
      validRows: normalizedRows.length,
      invalidRows: 0,
      validatedAt: new Date("2026-05-13T12:00:00.000Z")
    },
    create: {
      id: ids.importBatch,
      tenantId: ids.tenant,
      documentFileId: ids.document,
      createdBy: ids.fiscalOperator,
      status: "READY_FOR_REVIEW",
      sourceType: "structured_file",
      sourceName: "agenda-demo.csv",
      idempotencyKey: "demo-import-agenda-2026-05",
      totalRows: normalizedRows.length,
      validRows: normalizedRows.length,
      invalidRows: 0,
      validatedAt: new Date("2026-05-13T12:00:00.000Z")
    }
  });

  for (const row of normalizedRows) {
    await prisma.importRow.upsert({
      where: { id: row.id },
      update: {
        tenantId: ids.tenant,
        importBatchId: ids.importBatch,
        rowNumber: row.rowNumber,
        sourceRowId: row.sourceRowId,
        status: "CANDIDATE_CREATED",
        rawPayload: normalizedPayload(row),
        normalizedPayload: normalizedPayload(row),
        errorPayload: null
      },
      create: {
        id: row.id,
        tenantId: ids.tenant,
        importBatchId: ids.importBatch,
        rowNumber: row.rowNumber,
        sourceRowId: row.sourceRowId,
        status: "CANDIDATE_CREATED",
        rawPayload: normalizedPayload(row),
        normalizedPayload: normalizedPayload(row)
      }
    });
  }
}

async function upsertCandidates() {
  for (const row of normalizedRows) {
    await prisma.fiscalCandidate.upsert({
      where: { id: row.candidateId },
      update: {
        tenantId: ids.tenant,
        importBatchId: ids.importBatch,
        importRowId: row.id,
        documentFileId: ids.document,
        customerName: row.customerName,
        customerDocumentMasked: row.customerDocumentMasked,
        serviceDate: new Date("2026-05-13T00:00:00.000Z"),
        competenceDate: new Date("2026-05-01T00:00:00.000Z"),
        serviceDescription: row.serviceDescription,
        grossAmountCents: row.grossAmountCents,
        status: row.status,
        fiscalFingerprintVersion: "v1",
        fiscalFingerprint: row.fingerprint,
        reviewedBy: row.status === "NEEDS_REVIEW" || row.status === "BLOCKED" ? null : ids.fiscalManager,
        reviewedAt: row.status === "NEEDS_REVIEW" || row.status === "BLOCKED" ? null : new Date("2026-05-13T13:00:00.000Z")
      },
      create: {
        id: row.candidateId,
        tenantId: ids.tenant,
        importBatchId: ids.importBatch,
        importRowId: row.id,
        documentFileId: ids.document,
        customerName: row.customerName,
        customerDocumentMasked: row.customerDocumentMasked,
        serviceDate: new Date("2026-05-13T00:00:00.000Z"),
        competenceDate: new Date("2026-05-01T00:00:00.000Z"),
        serviceDescription: row.serviceDescription,
        grossAmountCents: row.grossAmountCents,
        status: row.status,
        fiscalFingerprintVersion: "v1",
        fiscalFingerprint: row.fingerprint,
        reviewedBy: row.status === "NEEDS_REVIEW" || row.status === "BLOCKED" ? null : ids.fiscalManager,
        reviewedAt: row.status === "NEEDS_REVIEW" || row.status === "BLOCKED" ? null : new Date("2026-05-13T13:00:00.000Z")
      }
    });
  }
}

async function upsertInconsistencies() {
  await prisma.fiscalInconsistency.upsert({
    where: { id: ids.inconsistencyBlocking },
    update: {
      tenantId: ids.tenant,
      candidateId: ids.candidateBlocked,
      importBatchId: ids.importBatch,
      importRowId: ids.rowBlocked,
      type: "MISSING_CUSTOMER_DATA",
      severity: "BLOCKING",
      status: "OPEN",
      message: "Tomador demo exige revisao humana antes de lote.",
      details: { evidence: "demo-only", sensitiveDataStored: false },
      resolutionNote: null,
      resolvedBy: null,
      resolvedAt: null
    },
    create: {
      id: ids.inconsistencyBlocking,
      tenantId: ids.tenant,
      candidateId: ids.candidateBlocked,
      importBatchId: ids.importBatch,
      importRowId: ids.rowBlocked,
      type: "MISSING_CUSTOMER_DATA",
      severity: "BLOCKING",
      status: "OPEN",
      message: "Tomador demo exige revisao humana antes de lote.",
      details: { evidence: "demo-only", sensitiveDataStored: false }
    }
  });

  await prisma.fiscalInconsistency.upsert({
    where: { id: ids.inconsistencyReviewable },
    update: {
      tenantId: ids.tenant,
      candidateId: ids.candidateReview,
      importBatchId: ids.importBatch,
      importRowId: ids.rowReview,
      type: "INCOMPLETE_DESCRIPTION",
      severity: "REVIEWABLE",
      status: "WAIVED",
      message: "Descricao demo revisavel para classificacao futura.",
      details: { evidence: "demo-only", sensitiveDataStored: false },
      resolutionNote: "Dispensa demo registrada para validar fluxo supervisionado.",
      resolvedBy: ids.fiscalManager,
      resolvedAt: new Date("2026-05-13T14:00:00.000Z")
    },
    create: {
      id: ids.inconsistencyReviewable,
      tenantId: ids.tenant,
      candidateId: ids.candidateReview,
      importBatchId: ids.importBatch,
      importRowId: ids.rowReview,
      type: "INCOMPLETE_DESCRIPTION",
      severity: "REVIEWABLE",
      status: "WAIVED",
      message: "Descricao demo revisavel para classificacao futura.",
      details: { evidence: "demo-only", sensitiveDataStored: false },
      resolutionNote: "Dispensa demo registrada para validar fluxo supervisionado.",
      resolvedBy: ids.fiscalManager,
      resolvedAt: new Date("2026-05-13T14:00:00.000Z")
    }
  });
}

async function upsertBatches() {
  await prisma.fiscalBatch.upsert({
    where: { id: ids.batchReview },
    update: {
      tenantId: ids.tenant,
      status: "SIMULATED",
      batchNumber: "DEMO-SIM-001",
      createdBy: ids.fiscalOperator,
      submittedBy: ids.fiscalOperator,
      submittedAt: new Date("2026-05-13T15:00:00.000Z"),
      simulatedBy: ids.fiscalOperator,
      simulatedAt: new Date("2026-05-13T15:30:00.000Z"),
      approvedBy: null,
      approvedAt: null,
      cancelledBy: null,
      cancelledAt: null,
      cancelReason: null,
      totalGrossAmountCents: 12000n
    },
    create: {
      id: ids.batchReview,
      tenantId: ids.tenant,
      status: "SIMULATED",
      batchNumber: "DEMO-SIM-001",
      createdBy: ids.fiscalOperator,
      submittedBy: ids.fiscalOperator,
      submittedAt: new Date("2026-05-13T15:00:00.000Z"),
      simulatedBy: ids.fiscalOperator,
      simulatedAt: new Date("2026-05-13T15:30:00.000Z"),
      approvedBy: null,
      approvedAt: null,
      cancelledBy: null,
      cancelledAt: null,
      cancelReason: null,
      totalGrossAmountCents: 12000n
    }
  });

  await prisma.fiscalBatch.upsert({
    where: { id: ids.batchApproved },
    update: {
      tenantId: ids.tenant,
      status: "APPROVED_FOR_FUTURE_ISSUANCE",
      batchNumber: "DEMO-APP-001",
      createdBy: ids.fiscalOperator,
      submittedBy: ids.fiscalOperator,
      submittedAt: new Date("2026-05-13T16:00:00.000Z"),
      simulatedBy: ids.fiscalOperator,
      simulatedAt: new Date("2026-05-13T16:30:00.000Z"),
      approvedBy: ids.fiscalManager,
      approvedAt: new Date("2026-05-13T17:00:00.000Z"),
      cancelledBy: null,
      cancelledAt: null,
      cancelReason: null,
      totalGrossAmountCents: 30000n
    },
    create: {
      id: ids.batchApproved,
      tenantId: ids.tenant,
      status: "APPROVED_FOR_FUTURE_ISSUANCE",
      batchNumber: "DEMO-APP-001",
      createdBy: ids.fiscalOperator,
      submittedBy: ids.fiscalOperator,
      submittedAt: new Date("2026-05-13T16:00:00.000Z"),
      simulatedBy: ids.fiscalOperator,
      simulatedAt: new Date("2026-05-13T16:30:00.000Z"),
      approvedBy: ids.fiscalManager,
      approvedAt: new Date("2026-05-13T17:00:00.000Z"),
      cancelledBy: null,
      cancelledAt: null,
      cancelReason: null,
      totalGrossAmountCents: 30000n
    }
  });

  await prisma.fiscalBatchItem.upsert({
    where: { id: ids.batchReviewItem },
    update: {
      tenantId: ids.tenant,
      batchId: ids.batchReview,
      candidateId: ids.candidateSimulated,
      status: "INCLUDED",
      grossAmountCents: 12000n
    },
    create: {
      id: ids.batchReviewItem,
      tenantId: ids.tenant,
      batchId: ids.batchReview,
      candidateId: ids.candidateSimulated,
      status: "INCLUDED",
      grossAmountCents: 12000n
    }
  });

  await prisma.fiscalBatchItem.upsert({
    where: { id: ids.batchApprovedItem },
    update: {
      tenantId: ids.tenant,
      batchId: ids.batchApproved,
      candidateId: ids.candidateApproved,
      status: "INCLUDED",
      grossAmountCents: 30000n
    },
    create: {
      id: ids.batchApprovedItem,
      tenantId: ids.tenant,
      batchId: ids.batchApproved,
      candidateId: ids.candidateApproved,
      status: "INCLUDED",
      grossAmountCents: 30000n
    }
  });
}

async function upsertAuditEvents() {
  const events = [
    {
      id: ids.auditImport,
      eventType: "imports.created",
      entityType: "ImportBatch",
      entityId: ids.importBatch,
      actorId: ids.fiscalOperator,
      afterPayload: { status: "READY_FOR_REVIEW", sourceName: "agenda-demo.csv" }
    },
    {
      id: ids.auditCandidate,
      eventType: "fiscal_candidate.created",
      entityType: "FiscalCandidate",
      entityId: ids.candidateReview,
      actorId: ids.fiscalOperator,
      afterPayload: { status: "NEEDS_REVIEW", fiscalFingerprintVersion: "v1" }
    },
    {
      id: ids.auditInconsistency,
      eventType: "inconsistency.opened",
      entityType: "FiscalInconsistency",
      entityId: ids.inconsistencyBlocking,
      actorId: ids.fiscalManager,
      afterPayload: { status: "OPEN", severity: "BLOCKING", type: "MISSING_CUSTOMER_DATA" }
    },
    {
      id: ids.auditBatchSimulated,
      eventType: "fiscal_batch.simulated_internally",
      entityType: "FiscalBatch",
      entityId: ids.batchReview,
      actorId: ids.fiscalOperator,
      beforePayload: { status: "IN_REVIEW" },
      afterPayload: { status: "SIMULATED" },
      metadata: { externalProviderCalled: false, nfseIssued: false }
    },
    {
      id: ids.auditBatchApproved,
      eventType: "fiscal_batch.approved_for_future_issuance",
      entityType: "FiscalBatch",
      entityId: ids.batchApproved,
      actorId: ids.fiscalManager,
      beforePayload: { status: "SIMULATED" },
      afterPayload: { status: "APPROVED_FOR_FUTURE_ISSUANCE" },
      metadata: { externalProviderCalled: false, nfseIssued: false }
    }
  ];

  for (const event of events) {
    await prisma.auditEvent.upsert({
      where: { id: event.id },
      update: {
        tenantId: ids.tenant,
        actorId: event.actorId,
        eventType: event.eventType,
        entityType: event.entityType,
        entityId: event.entityId,
        beforePayload: event.beforePayload,
        afterPayload: event.afterPayload,
        metadata: event.metadata,
        correlationId: `demo-${event.eventType}`
      },
      create: {
        id: event.id,
        tenantId: ids.tenant,
        actorId: event.actorId,
        eventType: event.eventType,
        entityType: event.entityType,
        entityId: event.entityId,
        beforePayload: event.beforePayload,
        afterPayload: event.afterPayload,
        metadata: event.metadata,
        correlationId: `demo-${event.eventType}`
      }
    });
  }
}

async function seed() {
  await upsertProfiles();
  await upsertImportData();
  await upsertCandidates();
  await upsertInconsistencies();
  await upsertBatches();
  await upsertAuditEvents();
}

if (require.main === module) {
  seed()
    .then(async () => {
      console.log("VetFiscal demo seed completed.");
      await prisma.$disconnect();
    })
    .catch(async (error) => {
      console.error("VetFiscal demo seed failed.", error);
      await prisma.$disconnect();
      process.exit(1);
    });
}

module.exports = { ids, normalizedRows, seed };


