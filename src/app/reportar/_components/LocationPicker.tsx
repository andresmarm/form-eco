"use client";

import { useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useFormContext } from "react-hook-form";
import type { ReportFormValues } from "@/lib/validation";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[260px] w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
      Cargando mapa...
    </div>
  ),
});

// Centro aproximado de Colombia, usado solo como punto de partida del mapa
// cuando no se pudo obtener la ubicación por GPS.
const COLOMBIA_CENTER: [number, number] = [4.5709, -74.2973];

// Algunos navegadores móviles nunca invocan ni el callback de éxito ni el de
// error de geolocation.getCurrentPosition (por ejemplo si el permiso queda
// pendiente sin respuesta). Este respaldo evita que la UI quede "cargando"
// para siempre en ese caso.
const GPS_FALLBACK_MS = 12000;

type GpsState = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export function LocationPicker() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ReportFormValues>();

  const [gpsState, setGpsState] = useState<GpsState>("idle");
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const locationSource = watch("locationSource");
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // El mapa se muestra siempre (con el centro de Colombia por defecto) en
  // lugar de esperar a que resuelva el GPS, para que tocar otros controles
  // del formulario nunca se vea afectado por un cambio de layout inesperado.
  const requestGps = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGpsState("unavailable");
      setValue("locationSource", "MANUAL");
      return;
    }
    setGpsState("requesting");
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    fallbackTimer.current = setTimeout(() => {
      setGpsState((current) => (current === "requesting" ? "denied" : current));
    }, GPS_FALLBACK_MS);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
        setValue("locationSource", "GPS");
        setValue("latitude", position.coords.latitude);
        setValue("longitude", position.coords.longitude);
        setGpsState("granted");
      },
      () => {
        if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
        setGpsState("denied");
        setValue("locationSource", "MANUAL");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setValue]);

  const handlePositionChange = useCallback(
    (lat: number, lng: number) => {
      setValue("latitude", lat);
      setValue("longitude", lng);
    },
    [setValue]
  );

  const mapLat = latitude ?? COLOMBIA_CENTER[0];
  const mapLng = longitude ?? COLOMBIA_CENTER[1];

  return (
    <div className="space-y-4">
      <div>
        <button
          type="button"
          onClick={requestGps}
          disabled={gpsState === "requesting"}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {gpsState === "requesting" ? "Obteniendo ubicación..." : "📍 Usar mi ubicación actual"}
        </button>

        {/* Alto reservado para el mensaje de estado, así aparecer/desaparecer no
            corre el mapa ni los campos de abajo mientras el usuario interactúa. */}
        <div className="mt-2 min-h-16 text-sm">
          {gpsState === "denied" && (
            <p className="text-amber-700">
              No pudimos acceder a tu ubicación. Escribe la dirección abajo, o toca el mapa para
              marcar el sitio si sabes ubicarlo.
            </p>
          )}
          {gpsState === "unavailable" && (
            <p className="text-amber-700">
              Tu dispositivo no permite compartir ubicación automáticamente. Escribe la dirección
              abajo.
            </p>
          )}
          {gpsState === "granted" && (
            <p className="text-emerald-700">
              Ubicación obtenida. Arrastra el pin si no está exactamente en el sitio.
            </p>
          )}
        </div>
      </div>

      {/* El mapa siempre se muestra (centrado en Colombia por defecto) en vez de
          esperar al GPS, para que la página no cambie de tamaño de forma
          impredecible mientras el usuario toca otros controles. */}
      <LocationMap latitude={mapLat} longitude={mapLng} onPositionChange={handlePositionChange} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="municipality" className="mb-1 block text-sm font-medium text-slate-700">
            Municipio / ciudad *
          </label>
          <input
            id="municipality"
            type="text"
            {...register("municipality")}
            placeholder="Ej. Necoclí"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          {errors.municipality && (
            <p className="mt-1 text-sm text-red-600">{errors.municipality.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="neighborhood" className="mb-1 block text-sm font-medium text-slate-700">
            Barrio / vereda
          </label>
          <input
            id="neighborhood"
            type="text"
            {...register("neighborhood")}
            placeholder="Opcional"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-700">
          Dirección o indicaciones {locationSource === "MANUAL" ? "*" : "(opcional)"}
        </label>
        <textarea
          id="address"
          {...register("address")}
          rows={2}
          placeholder='Ej. "Casa azul frente a la tienda La Esperanza, calle principal"'
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
      </div>
    </div>
  );
}
