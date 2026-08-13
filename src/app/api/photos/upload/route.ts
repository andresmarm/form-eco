import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "La foto es demasiado grande (máx 8MB)" }, { status: 400 });
  }
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Formato de imagen no soportado" }, { status: 400 });
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `reportes/${randomUUID()}.${extension}`;

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(filename, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    }

    // En Vercel el filesystem de las funciones es de solo lectura (excepto
    // /tmp, que no persiste entre invocaciones): sin BLOB_READ_WRITE_TOKEN no
    // hay dónde guardar la foto. Falla con un mensaje claro en vez de un 500
    // opaco al intentar escribir en disco.
    if (process.env.VERCEL) {
      return NextResponse.json(
        { error: "Falta configurar BLOB_READ_WRITE_TOKEN para guardar fotos en este entorno" },
        { status: 500 }
      );
    }

    // Fallback de desarrollo local (o VPS con disco persistente): sin
    // BLOB_READ_WRITE_TOKEN se guarda en /public/uploads para poder probar el
    // flujo completo sin depender de una cuenta de Vercel.
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "reportes");
    await mkdir(uploadsDir, { recursive: true });
    const localName = `${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, localName), buffer);

    // URL absoluta (no relativa): el payload del reporte valida photoUrls con
    // z.string().url(), que exige protocolo + host.
    const url = new URL(`/uploads/reportes/${localName}`, req.nextUrl.origin).toString();
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error("photos/upload failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo guardar la foto" },
      { status: 500 }
    );
  }
}
