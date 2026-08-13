"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMapProps {
  latitude: number;
  longitude: number;
  onPositionChange?: (lat: number, lng: number) => void;
  interactive?: boolean;
  zoom?: number;
  heightPx?: number;
}

function ClickHandler({ onPositionChange }: { onPositionChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationMap({
  latitude,
  longitude,
  onPositionChange,
  interactive = true,
  zoom = 16,
  heightPx = 260,
}: LocationMapProps) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (marker) {
      marker.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={zoom}
      style={{ height: `${heightPx}px`, width: "100%", borderRadius: "0.5rem" }}
      dragging={interactive}
      scrollWheelZoom={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[latitude, longitude]}
        icon={markerIcon}
        draggable={interactive}
        ref={markerRef}
        eventHandlers={
          interactive && onPositionChange
            ? {
                dragend: () => {
                  const marker = markerRef.current;
                  if (marker) {
                    const pos = marker.getLatLng();
                    onPositionChange(pos.lat, pos.lng);
                  }
                },
              }
            : undefined
        }
      />
      {interactive && onPositionChange && <ClickHandler onPositionChange={onPositionChange} />}
    </MapContainer>
  );
}
