"use client";

import { useSearchParams } from "next/navigation";

export function ExportCsvButton() {
  const searchParams = useSearchParams();
  const href = `/api/export?${searchParams.toString()}`;

  return (
    <a
      href={href}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      ⬇ Exportar CSV
    </a>
  );
}
