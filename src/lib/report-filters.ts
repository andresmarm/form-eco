import type { Prisma } from "@prisma/client";

export interface ReportFilters {
  status?: string;
  category?: string;
  municipality?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type ReportSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

export function parseReportFilters(searchParams: ReportSearchParams): ReportFilters {
  return {
    status: firstValue(searchParams.status),
    category: firstValue(searchParams.category),
    municipality: firstValue(searchParams.municipality),
    dateFrom: firstValue(searchParams.dateFrom),
    dateTo: firstValue(searchParams.dateTo),
  };
}

export function buildReportWhere(filters: ReportFilters): Prisma.ReportWhereInput {
  const where: Prisma.ReportWhereInput = {};

  if (filters.status) {
    where.status = filters.status as Prisma.ReportWhereInput["status"];
  }
  if (filters.municipality) {
    where.municipality = { equals: filters.municipality, mode: "insensitive" };
  }
  if (filters.category) {
    where.needItems = {
      some: { category: filters.category as Prisma.NeedItemWhereInput["category"] },
    };
  }
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(`${filters.dateTo}T23:59:59.999Z`) } : {}),
    };
  }

  return where;
}

// Igual que buildReportWhere, pero para consultar NeedItem directamente
// (usado por el dashboard de agregados): category filtra el propio ítem,
// el resto de filtros se anidan sobre el reporte relacionado.
export function buildNeedItemWhere(filters: ReportFilters): Prisma.NeedItemWhereInput {
  const where: Prisma.NeedItemWhereInput = {};

  if (filters.category) {
    where.category = filters.category as Prisma.NeedItemWhereInput["category"];
  }

  const reportWhere: Prisma.ReportWhereInput = {};
  if (filters.status) {
    reportWhere.status = filters.status as Prisma.ReportWhereInput["status"];
  }
  if (filters.municipality) {
    reportWhere.municipality = { equals: filters.municipality, mode: "insensitive" };
  }
  if (filters.dateFrom || filters.dateTo) {
    reportWhere.createdAt = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(`${filters.dateTo}T23:59:59.999Z`) } : {}),
    };
  }
  if (Object.keys(reportWhere).length > 0) {
    where.report = reportWhere;
  }

  return where;
}
