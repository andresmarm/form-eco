import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db";
import { reportInputSchema, type ReportFormValues } from "@/lib/validation";

export interface EnqueueResult {
  clientId: string;
  synced: boolean;
}

export async function enqueueReport(
  formValues: ReportFormValues,
  photoFiles: File[]
): Promise<EnqueueResult> {
  const db = await getDb();
  const clientId = uuidv4();
  const photoIds: string[] = [];

  const tx = db.transaction(["pending-reports", "pending-photos"], "readwrite");
  for (const file of photoFiles) {
    const id = uuidv4();
    await tx.objectStore("pending-photos").put({
      id,
      clientId,
      blob: file,
      mimeType: file.type,
    });
    photoIds.push(id);
  }
  await tx.objectStore("pending-reports").put({
    clientId,
    data: formValues,
    photoIds,
    status: "queued",
    createdAt: Date.now(),
  });
  await tx.done;

  const synced = await syncReport(clientId);
  return { clientId, synced };
}

export async function syncReport(clientId: string): Promise<boolean> {
  const db = await getDb();
  const pending = await db.get("pending-reports", clientId);
  if (!pending || pending.status === "synced") return true;

  await db.put("pending-reports", { ...pending, status: "syncing" });

  try {
    const photos = await db.getAllFromIndex("pending-photos", "by-clientId", clientId);
    const photoUrls: string[] = [];

    for (const photo of photos) {
      const extension = photo.mimeType === "image/png" ? "png" : "jpg";
      const form = new FormData();
      form.append("file", photo.blob, `${photo.id}.${extension}`);
      const res = await fetch("/api/photos/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("No se pudo subir una foto");
      const json = (await res.json()) as { url: string };
      photoUrls.push(json.url);
    }

    const payload = reportInputSchema.parse({
      ...pending.data,
      clientId,
      photoUrls,
    });

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("No se pudo enviar el reporte");

    const current = await db.get("pending-reports", clientId);
    if (current) {
      await db.put("pending-reports", { ...current, status: "synced" });
    }

    if (photos.length > 0) {
      const delTx = db.transaction("pending-photos", "readwrite");
      for (const photo of photos) {
        await delTx.store.delete(photo.id);
      }
      await delTx.done;
    }

    return true;
  } catch (err) {
    const current = await db.get("pending-reports", clientId);
    if (current) {
      await db.put("pending-reports", {
        ...current,
        status: "queued",
        lastError: err instanceof Error ? err.message : "Error desconocido",
      });
    }
    return false;
  }
}

export async function getPendingReports() {
  const db = await getDb();
  return db.getAll("pending-reports");
}

export async function syncAllPending(): Promise<void> {
  const db = await getDb();
  const all = await db.getAll("pending-reports");
  for (const report of all) {
    if (report.status !== "synced") {
      await syncReport(report.clientId);
    }
  }
}
