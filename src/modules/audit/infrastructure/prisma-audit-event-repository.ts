import type { AuditEventFilters, AuditEventQueryRepository, AuditEventRecord } from "@/modules/audit/application/audit-event-queries";
import { prisma } from "@/shared/database/prisma";

function paging(filters: AuditEventFilters) {
  const page = filters.page ?? 1;
  const pageSize = Math.min(filters.pageSize ?? 50, 100);
  return { skip: (page - 1) * pageSize, take: pageSize };
}

function whereClause(tenantId: string, filters: AuditEventFilters) {
  return {
    tenantId,
    eventType: filters.eventType,
    entityType: filters.entityType,
    entityId: filters.entityId,
    actorId: filters.actorId,
    correlationId: filters.correlationId,
    createdAt: filters.createdFrom || filters.createdTo ? { gte: filters.createdFrom, lte: filters.createdTo } : undefined
  };
}

export function createPrismaAuditEventRepository(): AuditEventQueryRepository {
  return {
    async listAuditEvents(input): Promise<AuditEventRecord[]> {
      return prisma.auditEvent.findMany({
        where: whereClause(input.tenantId, input.filters),
        orderBy: { createdAt: "desc" },
        ...paging(input.filters)
      });
    },

    async findAuditEvent(input): Promise<AuditEventRecord | null> {
      return prisma.auditEvent.findFirst({ where: { id: input.id, tenantId: input.tenantId } });
    }
  };
}
