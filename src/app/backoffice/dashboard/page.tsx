import { prisma } from "@/lib/prisma";
import {
  buildNeedItemWhere,
  buildReportWhere,
  parseReportFilters,
  type ReportSearchParams,
} from "@/lib/report-filters";
import { FiltersBar } from "../_components/FiltersBar";
import { AggregateSummary, type ItemTotal, type MunicipalityTotal } from "../_components/AggregateSummary";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<ReportSearchParams>;
}) {
  const resolvedParams = await searchParams;
  const filters = parseReportFilters(resolvedParams);

  const [itemGroups, municipalityGroups, municipalityRows] = await Promise.all([
    prisma.needItem.groupBy({
      by: ["category", "itemKey", "itemLabel", "unit"],
      where: buildNeedItemWhere(filters),
      _sum: { quantity: true },
      _count: { _all: true },
    }),
    prisma.report.groupBy({
      by: ["municipality"],
      where: buildReportWhere(filters),
      _count: { _all: true },
    }),
    prisma.report.findMany({
      select: { municipality: true },
      distinct: ["municipality"],
      orderBy: { municipality: "asc" },
    }),
  ]);

  const itemTotals: ItemTotal[] = itemGroups
    .map((g) => ({
      category: g.category,
      itemKey: g.itemKey,
      itemLabel: g.itemLabel,
      unit: g.unit,
      totalQuantity: g._sum.quantity ?? 0,
      reportCount: g._count._all,
    }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity);

  const municipalityTotals: MunicipalityTotal[] = municipalityGroups
    .map((g) => ({ municipality: g.municipality, reportCount: g._count._all }))
    .sort((a, b) => b.reportCount - a.reportCount);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Dashboard de necesidades</h1>
      <FiltersBar municipalities={municipalityRows.map((r) => r.municipality)} />
      <AggregateSummary itemTotals={itemTotals} municipalityTotals={municipalityTotals} />
    </div>
  );
}
