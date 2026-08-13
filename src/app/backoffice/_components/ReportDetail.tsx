"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import type { NeedItem, Photo, Report } from "@prisma/client";
import { REPORT_STATUS_LABELS } from "@/lib/needs-catalog";
import { updateReportStatus, updateInternalNotes } from "@/actions/reports";
import { NeedItemRow } from "./NeedItemRow";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[220px] w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
      Cargando mapa...
    </div>
  ),
});

const STATUS_OPTIONS = ["NUEVO", "EN_REVISION", "EN_PROCESO", "ATENDIDO", "CERRADO"] as const;

type ReportWithRelations = Report & { needItems: NeedItem[]; photos: Photo[] };

export function ReportDetail({ report }: { report: ReportWithRelations }) {
  const [status, setStatus] = useState(report.status);
  const [notes, setNotes] = useState(report.internalNotes ?? "");
  const [notesSaved, setNotesSaved] = useState(true);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus as Report["status"]);
    startTransition(async () => {
      await updateReportStatus(report.id, newStatus);
    });
  }

  function handleSaveNotes() {
    startTransition(async () => {
      await updateInternalNotes(report.id, notes);
      setNotesSaved(true);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Contacto</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Nombre</dt>
              <dd className="font-medium text-slate-900">{report.contactName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Teléfono principal</dt>
              <dd>
                <a href={`tel:${report.phonePrimary}`} className="font-medium text-emerald-700">
                  {report.phonePrimary}
                </a>
              </dd>
            </div>
            {report.phoneAlternate && (
              <div>
                <dt className="text-slate-500">Teléfono alterno</dt>
                <dd>
                  <a href={`tel:${report.phoneAlternate}`} className="font-medium text-emerald-700">
                    {report.phoneAlternate}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Ubicación</h2>
          <dl className="mb-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Municipio</dt>
              <dd className="font-medium text-slate-900">{report.municipality}</dd>
            </div>
            {report.neighborhood && (
              <div>
                <dt className="text-slate-500">Barrio / vereda</dt>
                <dd className="font-medium text-slate-900">{report.neighborhood}</dd>
              </div>
            )}
            {report.address && (
              <div className="col-span-2">
                <dt className="text-slate-500">Dirección / indicaciones</dt>
                <dd className="font-medium text-slate-900">{report.address}</dd>
              </div>
            )}
            <div>
              <dt className="text-slate-500">Origen</dt>
              <dd className="font-medium text-slate-900">
                {report.locationSource === "GPS" ? "GPS del dispositivo" : "Ingresada manualmente"}
              </dd>
            </div>
          </dl>
          {report.latitude !== null && report.longitude !== null && (
            <LocationMap latitude={report.latitude} longitude={report.longitude} interactive={false} />
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-1 text-lg font-semibold text-slate-900">Necesidades</h2>
          <p className="mb-3 text-xs text-slate-500">
            Actualiza el estado de cada necesidad a medida que se gestiona.
          </p>
          <div>
            {report.needItems.map((item) => (
              <NeedItemRow key={item.id} reportId={report.id} item={item} />
            ))}
          </div>
        </section>

        {report.photos.length > 0 && (
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Fotos</h2>
            <div className="flex flex-wrap gap-3">
              {report.photos.map((photo) => (
                <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt="Evidencia del daño"
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Estado del reporte</h2>
          <select
            value={status}
            disabled={isPending}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-60"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {REPORT_STATUS_LABELS[opt]}
              </option>
            ))}
          </select>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Notas internas</h2>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setNotesSaved(false);
            }}
            rows={5}
            placeholder="Notas de seguimiento, contacto realizado, etc."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={isPending || notesSaved}
            className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {notesSaved ? "Guardado" : "Guardar notas"}
          </button>
        </section>
      </div>
    </div>
  );
}
