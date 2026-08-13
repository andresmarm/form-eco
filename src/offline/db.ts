import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ReportFormValues } from "@/lib/validation";

export interface PendingPhoto {
  id: string;
  clientId: string;
  blob: Blob;
  mimeType: string;
}

export type PendingReportStatus = "queued" | "syncing" | "synced";

export interface PendingReport {
  clientId: string;
  data: ReportFormValues;
  photoIds: string[];
  status: PendingReportStatus;
  createdAt: number;
  lastError?: string;
}

interface EcoReportsDB extends DBSchema {
  "pending-reports": {
    key: string;
    value: PendingReport;
  };
  "pending-photos": {
    key: string;
    value: PendingPhoto;
    indexes: { "by-clientId": string };
  };
}

let dbPromise: Promise<IDBPDatabase<EcoReportsDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<EcoReportsDB>> {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB solo está disponible en el navegador");
  }
  if (!dbPromise) {
    dbPromise = openDB<EcoReportsDB>("eco-reports", 1, {
      upgrade(db) {
        db.createObjectStore("pending-reports", { keyPath: "clientId" });
        const photoStore = db.createObjectStore("pending-photos", { keyPath: "id" });
        photoStore.createIndex("by-clientId", "clientId");
      },
    });
  }
  return dbPromise;
}
