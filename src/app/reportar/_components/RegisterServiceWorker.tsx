"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Si alguna vez se probó una build de producción desde este mismo origen
      // (ej. `next start` en la misma IP de red), el service worker y sus
      // caches quedan instalados en el navegador/teléfono y siguen sirviendo
      // versiones viejas del formulario en visitas futuras, incluso contra el
      // servidor de desarrollo. En dev nos aseguramos de limpiarlos.
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js", { scope: "/reportar/" }).catch(() => {
      // El formulario sigue funcionando sin service worker, solo sin cache offline de la app shell.
    });
  }, []);

  return null;
}
