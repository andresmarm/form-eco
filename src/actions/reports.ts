"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  reportStatusEnum,
  needItemStatusEnum,
  updateInternalNotesSchema,
} from "@/lib/validation";

function revalidateBackoffice(reportId: string) {
  revalidatePath("/backoffice/tabla");
  revalidatePath("/backoffice/mapa");
  revalidatePath("/backoffice/dashboard");
  revalidatePath(`/backoffice/reportes/${reportId}`);
}

export async function updateReportStatus(reportId: string, status: string) {
  const parsedStatus = reportStatusEnum.parse(status);
  await prisma.report.update({
    where: { id: reportId },
    data: { status: parsedStatus },
  });
  revalidateBackoffice(reportId);
}

export async function updateNeedItemStatus(
  reportId: string,
  needItemId: string,
  status: string
) {
  const parsedStatus = needItemStatusEnum.parse(status);
  await prisma.needItem.update({
    where: { id: needItemId },
    data: { status: parsedStatus },
  });
  revalidateBackoffice(reportId);
}

export async function updateInternalNotes(reportId: string, internalNotes: string) {
  const parsed = updateInternalNotesSchema.parse({ internalNotes });
  await prisma.report.update({
    where: { id: reportId },
    data: { internalNotes: parsed.internalNotes },
  });
  revalidateBackoffice(reportId);
}
