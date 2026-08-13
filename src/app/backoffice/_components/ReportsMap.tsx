"use client";

import dynamic from "next/dynamic";
import type { ReportWithNeedItems } from "./ReportsMapInner";

const ReportsMapInner = dynamic(() => import("./ReportsMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
      Cargando mapa...
    </div>
  ),
});

export function ReportsMap({ reports }: { reports: ReportWithNeedItems[] }) {
  return <ReportsMapInner reports={reports} />;
}
