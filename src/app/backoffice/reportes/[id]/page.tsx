import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReportDetail } from "../../_components/ReportDetail";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: { needItems: true, photos: true },
  });

  if (!report) notFound();

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Reporte de {report.contactName}</h1>
      <ReportDetail report={report} />
    </div>
  );
}
