"use client";

import { useEffect, useMemo } from "react";

interface PhotoUploaderProps {
  photos: File[];
  onChange: (photos: File[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({ photos, onChange, maxPhotos = 5 }: PhotoUploaderProps) {
  const previews = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles = Array.from(fileList).slice(0, Math.max(0, maxPhotos - photos.length));
    onChange([...photos, ...newFiles]);
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {photos.length < maxPhotos && (
        <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          📷 Agregar foto
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((src, index) => (
            <div key={src} className="relative">
              {/* Vista previa de un blob: local, next/image no aplica aquí */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Foto ${index + 1}`}
                className="h-24 w-24 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                aria-label="Quitar foto"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500">
        Hasta {maxPhotos} fotos como evidencia del daño (opcional).
      </p>
    </div>
  );
}
