import Link from "next/link";

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ queued?: string }>;
}) {
  const { queued } = await searchParams;
  const isQueued = queued === "1";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 text-5xl">{isQueued ? "📶" : "✅"}</div>
      <h1 className="text-2xl font-bold text-slate-900">
        {isQueued ? "Reporte guardado en tu dispositivo" : "¡Reporte enviado!"}
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        {isQueued
          ? "No detectamos conexión en este momento. Tu reporte se enviará automáticamente en cuanto tengas señal. No cierres ni desinstales la app antes de que eso ocurra."
          : "Gracias por reportar tu necesidad. Un voluntario te llamará pronto para confirmar la información."}
      </p>
      <Link
        href="/reportar"
        className="mt-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
      >
        Enviar otro reporte
      </Link>
    </main>
  );
}
