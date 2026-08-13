import { getCategory } from "@/lib/needs-catalog";

export interface ItemTotal {
  category: string;
  itemKey: string;
  itemLabel: string;
  unit: string;
  totalQuantity: number;
  reportCount: number;
}

export interface MunicipalityTotal {
  municipality: string;
  reportCount: number;
}

export function AggregateSummary({
  itemTotals,
  municipalityTotals,
}: {
  itemTotals: ItemTotal[];
  municipalityTotals: MunicipalityTotal[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Totales por necesidad</h2>
        {itemTotals.length === 0 ? (
          <p className="text-sm text-slate-500">No hay datos con los filtros actuales.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Necesidad</th>
                <th className="py-2 pr-4">Categoría</th>
                <th className="py-2 pr-4">Cantidad total</th>
                <th className="py-2">Reportes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemTotals.map((row) => (
                <tr key={`${row.category}-${row.itemKey}-${row.unit}`}>
                  <td className="py-2 pr-4 font-medium text-slate-900">{row.itemLabel}</td>
                  <td className="py-2 pr-4 text-slate-600">
                    {getCategory(row.category)?.label ?? row.category}
                  </td>
                  <td className="py-2 pr-4 text-slate-900">
                    {row.totalQuantity} {row.unit}
                  </td>
                  <td className="py-2 text-slate-600">{row.reportCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Reportes por municipio</h2>
        {municipalityTotals.length === 0 ? (
          <p className="text-sm text-slate-500">Sin datos.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {municipalityTotals.map((row) => (
              <li key={row.municipality} className="flex items-center justify-between">
                <span className="text-slate-900">{row.municipality}</span>
                <span className="font-medium text-slate-600">{row.reportCount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
