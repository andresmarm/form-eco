"use client";

import { useCallback, useEffect, useState } from "react";
import { getPendingReports, syncAllPending } from "./queue";

export function useOnlineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshCount = useCallback(async () => {
    const pending = await getPendingReports();
    setPendingCount(pending.filter((r) => r.status !== "synced").length);
  }, []);

  useEffect(() => {
    // Corrige el estado tras montar (el valor por defecto evita un mismatch de hidratación,
    // ya que `navigator` no existe durante el renderizado en el servidor).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOnline(navigator.onLine);
    refreshCount();

    async function trySync() {
      if (!navigator.onLine) return;
      await syncAllPending();
      await refreshCount();
    }

    trySync();

    function handleOnline() {
      setIsOnline(true);
      trySync();
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    // Respaldo a eventos 'online'/'offline', poco confiables en algunos móviles.
    const interval = setInterval(trySync, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [refreshCount]);

  return { isOnline, pendingCount, refreshCount };
}
