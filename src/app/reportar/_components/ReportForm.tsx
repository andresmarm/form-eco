"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reportFormSchema, type ReportFormValues } from "@/lib/validation";
import { enqueueReport } from "@/offline/queue";
import { LocationPicker } from "./LocationPicker";
import { NeedItemsEditor } from "./NeedItemsEditor";
import { PhotoUploader } from "./PhotoUploader";
import { SyncStatusBanner } from "./SyncStatusBanner";

const defaultValues: ReportFormValues = {
  contactName: "",
  phonePrimary: "",
  phoneAlternate: "",
  locationSource: "MANUAL",
  latitude: undefined,
  longitude: undefined,
  address: "",
  municipality: "",
  neighborhood: "",
  needItems: [],
};

// Guarda el progreso del formulario mientras el usuario lo llena, para no
// perderlo si el navegador descarta la pestaña por inactividad (frecuente
// en móviles cuando la pantalla se bloquea o se cambia de app).
const DRAFT_STORAGE_KEY = "reportar:draft";

function loadDraft(): Partial<ReportFormValues> | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<ReportFormValues>) : null;
  } catch {
    return null;
  }
}

function saveDraft(values: ReportFormValues) {
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Almacenamiento no disponible (modo privado, cuota llena, etc.): el
    // formulario sigue funcionando, solo sin borrador persistente.
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignorar
  }
}

export function ReportForm() {
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues,
  });

  useEffect(() => {
    const draft = loadDraft();
    if (draft) methods.reset({ ...defaultValues, ...draft });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = methods.watch((values) => {
      saveDraft(values as ReportFormValues);
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  async function onSubmit(values: ReportFormValues) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await enqueueReport(values, photos);
      clearDraft();
      router.push(`/reportar/gracias?queued=${result.synced ? "0" : "1"}`);
    } catch {
      setSubmitError(
        "No pudimos guardar tu reporte en este dispositivo. Intenta de nuevo o cierra y abre la app."
      );
      setSubmitting(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <SyncStatusBanner />
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Datos de contacto</h2>
          <p className="mb-3 text-sm text-slate-500">
            Los usamos únicamente para llamarte y confirmar la información de tu reporte.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contactName" className="mb-1 block text-sm font-medium text-slate-700">
                Nombre completo *
              </label>
              <input
                id="contactName"
                type="text"
                {...methods.register("contactName")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              {methods.formState.errors.contactName && (
                <p className="mt-1 text-sm text-red-600">
                  {methods.formState.errors.contactName.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="phonePrimary" className="mb-1 block text-sm font-medium text-slate-700">
                Teléfono principal *
              </label>
              <input
                id="phonePrimary"
                type="tel"
                inputMode="tel"
                {...methods.register("phonePrimary")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              {methods.formState.errors.phonePrimary && (
                <p className="mt-1 text-sm text-red-600">
                  {methods.formState.errors.phonePrimary.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="phoneAlternate"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Teléfono alterno (opcional)
              </label>
              <input
                id="phoneAlternate"
                type="tel"
                inputMode="tel"
                {...methods.register("phoneAlternate")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Ubicación</h2>
          <LocationPicker />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">¿Qué necesitas?</h2>
          <NeedItemsEditor />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Fotos del daño</h2>
          <PhotoUploader photos={photos} onChange={setPhotos} />
        </section>

        {submitError && (
          <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Enviando..." : "Enviar reporte"}
        </button>
      </form>
    </FormProvider>
  );
}
