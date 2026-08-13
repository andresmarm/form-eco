import Link from "next/link";
import type { NeedItem, Report } from "@prisma/client";
import { getCategory } from "@/lib/needs-catalog";
import { REPORT_STATUS_LABELS } from "@/lib/needs-catalog";

type ReportWithNeedItems = Report & { needItems: NeedItem[] };

const STATUS_BADGE_CLASSES: Record<string, string> = {
  NUEVO: "bg-red-100 text-red-800",
  EN_REVISION: "bg-amber-100 text-amber-800",
  EN_PROCESO: "bg-blue-100 text-blue-800",
  ATENDIDO: "bg-emerald-100 text-emerald-800",
  CERRADO: "bg-slate-200 text-slate-700",
};

function categorySummary(needItems: NeedItem[]): string {
  const labels = Array.from(
    new Set(needItems.map((item) => getCategory(item.category)?.label ?? item.category))
  );
  return labels.join(", ");
}

export function ReportsTable({ reports }: { reports: ReportWithNeedItems[] }) {
  if (reports.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        No hay reportes que coincidan con los filtros.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Contacto</th>
            <th className="px-4 py-3">Ubicación</th>
            <th className="px-4 py-3">Necesidades</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="font-medium text-slate-900">{report.contactName}</div>
                <div className="text-slate-500">{report.phonePrimary}</div>
              </td>
              <td className="px-4 py-3">
                <div>{report.municipality}</div>
                {report.neighborhood && (
                  <div className="text-slate-500">{report.neighborhood}</div>
                )}
              </td>
              <td className="px-4 py-3 text-slate-600">{categorySummary(report.needItems)}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    STATUS_BADGE_CLASSES[report.status] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {REPORT_STATUS_LABELS[report.status] ?? report.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                {new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "short" }).format(
                  report.createdAt
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/backoffice/reportes/${report.id}`}
                  className="font-medium text-emerald-700 hover:underline"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
