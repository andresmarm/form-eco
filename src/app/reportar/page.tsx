import { ReportForm } from "./_components/ReportForm";

export default function ReportarPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Reporta lo que necesitas
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Cuéntanos qué necesitas y dónde estás. Un voluntario te llamará para confirmar la
          información. Puedes usar este formulario incluso sin conexión: se enviará
          automáticamente cuando vuelva la señal.
        </p>
      </header>
      <ReportForm />
    </main>
  );
}
