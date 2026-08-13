import { prisma } from "@/lib/prisma";
import { buildReportWhere, parseReportFilters, type ReportSearchParams } from "@/lib/report-filters";
import { FiltersBar } from "../_components/FiltersBar";
import { ReportsMap } from "../_components/ReportsMap";

export default async function MapaPage({
  searchParams,
}: {
  searchParams: Promise<ReportSearchParams>;
}) {
  const resolvedParams = await searchParams;
  const filters = parseReportFilters(resolvedParams);
  const where = buildReportWhere(filters);

  const [reports, municipalityRows] = await Promise.all([
    prisma.report.findMany({
      where,
      include: { needItems: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.report.findMany({
      select: { municipality: true },
      distinct: ["municipality"],
      orderBy: { municipality: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Mapa de reportes</h1>
      <FiltersBar municipalities={municipalityRows.map((r) => r.municipality)} />
      <ReportsMap reports={reports} />
    </div>
  );
}
