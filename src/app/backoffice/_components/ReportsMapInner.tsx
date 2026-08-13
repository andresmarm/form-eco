"use client";

import Link from "next/link";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { NeedItem, Report } from "@prisma/client";
import { REPORT_STATUS_LABELS } from "@/lib/needs-catalog";

export type ReportWithNeedItems = Report & { needItems: NeedItem[] };

const STATUS_COLORS: Record<string, string> = {
  NUEVO: "#dc2626",
  EN_REVISION: "#d97706",
  EN_PROCESO: "#2563eb",
  ATENDIDO: "#059669",
  CERRADO: "#64748b",
};

const COLOMBIA_CENTER: [number, number] = [4.5709, -74.2973];

export default function ReportsMapInner({ reports }: { reports: ReportWithNeedItems[] }) {
  const withLocation = reports.filter(
    (r): r is ReportWithNeedItems & { latitude: number; longitude: number } =>
      r.latitude !== null && r.longitude !== null
  );

  const center: [number, number] =
    withLocation.length > 0 ? [withLocation[0].latitude, withLocation[0].longitude] : COLOMBIA_CENTER;

  return (
    <div>
      <MapContainer
        center={center}
        zoom={withLocation.length > 0 ? 8 : 5}
        style={{ height: "600px", width: "100%", borderRadius: "0.5rem" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withLocation.map((report) => (
          <CircleMarker
            key={report.id}
            center={[report.latitude, report.longitude]}
            radius={9}
            pathOptions={{
              color: STATUS_COLORS[report.status] ?? "#64748b",
              fillColor: STATUS_COLORS[report.status] ?? "#64748b",
              fillOpacity: 0.85,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{report.contactName}</div>
                <div>{report.phonePrimary}</div>
                <div>
                  {report.municipality}
                  {report.neighborhood ? ` · ${report.neighborhood}` : ""}
                </div>
                <div className="mt-1">{REPORT_STATUS_LABELS[report.status] ?? report.status}</div>
                <Link
                  href={`/backoffice/reportes/${report.id}`}
                  className="mt-1 inline-block font-medium text-emerald-700 hover:underline"
                >
                  Ver detalle
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {reports.length > withLocation.length && (
        <p className="mt-2 text-xs text-slate-500">
          {reports.length - withLocation.length} reporte(s) sin coordenadas no se muestran en el mapa
          (ubicación solo por dirección escrita).
        </p>
      )}
    </div>
  );
}
