import Link from "next/link";

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-semibold text-slate-900">Backoffice · Reportes</span>
          <nav className="flex gap-4 text-sm font-medium text-slate-600">
            <Link href="/backoffice/tabla" className="hover:text-emerald-700">
              Tabla
            </Link>
            <Link href="/backoffice/mapa" className="hover:text-emerald-700">
              Mapa
            </Link>
            <Link href="/backoffice/dashboard" className="hover:text-emerald-700">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
