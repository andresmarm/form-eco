"use client";

import { useOnlineSync } from "@/offline/useOnlineSync";

export function SyncStatusBanner() {
  const { isOnline, pendingCount } = useOnlineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
        isOnline
          ? "border-amber-300 bg-amber-50 text-amber-800"
          : "border-red-300 bg-red-50 text-red-800"
      }`}
    >
      {!isOnline
        ? "Sin conexión. Los reportes se guardan en este dispositivo y se enviarán automáticamente cuando vuelva la señal."
        : `Enviando ${pendingCount} reporte${pendingCount === 1 ? "" : "s"} pendiente${
            pendingCount === 1 ? "" : "s"
          }...`}
    </div>
  );
}
