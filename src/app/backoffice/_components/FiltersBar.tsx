"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { NEED_CATEGORIES, REPORT_STATUS_LABELS } from "@/lib/needs-catalog";

interface FiltersBarProps {
  municipalities: string[];
}

export function FiltersBar({ municipalities }: FiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";
  const municipality = searchParams.get("municipality") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const hasFilters = status || category || municipality || dateFrom || dateTo;

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Estado</label>
        <select
          value={status}
          onChange={(e) => setParam("status", e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todos</option>
          {Object.entries(REPORT_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Categoría</label>
        <select
          value={category}
          onChange={(e) => setParam("category", e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todas</option>
          {NEED_CATEGORIES.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Municipio</label>
        <select
          value={municipality}
          onChange={(e) => setParam("municipality", e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todos</option>
          {municipalities.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Desde</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setParam("dateFrom", e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Hasta</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setParam("dateTo", e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
