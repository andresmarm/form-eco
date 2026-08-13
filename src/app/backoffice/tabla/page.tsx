import { prisma } from "@/lib/prisma";
import { buildReportWhere, parseReportFilters, type ReportSearchParams } from "@/lib/report-filters";
import { FiltersBar } from "../_components/FiltersBar";
import { ReportsTable } from "../_components/ReportsTable";
import { ExportCsvButton } from "../_components/ExportCsvButton";

export default async function TablaPage({
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
      include: { needItems: true, photos: true },
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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Reportes ({reports.length})</h1>
        <ExportCsvButton />
      </div>
      <FiltersBar municipalities={municipalityRows.map((r) => r.municipality)} />
      <ReportsTable reports={reports} />
    </div>
  );
}
