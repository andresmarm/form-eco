import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildReportWhere, parseReportFilters } from "@/lib/report-filters";
import { getCategory } from "@/lib/needs-catalog";
import { REPORT_STATUS_LABELS, NEED_ITEM_STATUS_LABELS } from "@/lib/needs-catalog";
import { toCsv } from "@/lib/csv";

const COLUMNS = [
  "reporteId",
  "fecha",
  "contactoNombre",
  "telefonoPrincipal",
  "telefonoAlterno",
  "municipio",
  "barrioVereda",
  "direccion",
  "latitud",
  "longitud",
  "estadoReporte",
  "categoriaNecesidad",
  "necesidad",
  "cantidad",
  "unidad",
  "estadoNecesidad",
  "notaNecesidad",
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filters = parseReportFilters(Object.fromEntries(searchParams.entries()));
  const where = buildReportWhere(filters);

  const reports = await prisma.report.findMany({
    where,
    include: { needItems: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = reports.flatMap((report) =>
    report.needItems.map((item) => ({
      reporteId: report.id,
      fecha: report.createdAt.toISOString(),
      contactoNombre: report.contactName,
      telefonoPrincipal: report.phonePrimary,
      telefonoAlterno: report.phoneAlternate ?? "",
      municipio: report.municipality,
      barrioVereda: report.neighborhood ?? "",
      direccion: report.address ?? "",
      latitud: report.latitude ?? "",
      longitud: report.longitude ?? "",
      estadoReporte: REPORT_STATUS_LABELS[report.status] ?? report.status,
      categoriaNecesidad: getCategory(item.category)?.label ?? item.category,
      necesidad: item.itemLabel,
      cantidad: item.quantity,
      unidad: item.unit,
      estadoNecesidad: NEED_ITEM_STATUS_LABELS[item.status] ?? item.status,
      notaNecesidad: item.note ?? "",
    }))
  );

  const csv = toCsv(rows, COLUMNS);
  const filename = `reportes-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
