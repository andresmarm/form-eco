import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">
        Ayuda para damnificados del terremoto
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        Si necesitas materiales, alimentos, medicamentos, herramientas o algún servicio,
        cuéntanos qué necesitas y dónde estás.
      </p>
      <Link
        href="/reportar"
        className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white"
      >
        Reportar una necesidad
      </Link>
    </main>
  );
}
