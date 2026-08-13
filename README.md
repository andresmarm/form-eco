# Reporte Terremoto Colombia

Plataforma para recolectar y consolidar reportes de necesidades de damnificados tras el
terremoto del 10 de agosto de 2026 en Colombia.

- **Front público** (`/reportar`): las víctimas reportan qué necesitan (materiales, alimentos,
  medicamentos, herramientas, servicios como demolición) y dónde están (GPS o dirección escrita
  a mano), junto con datos de contacto. Funciona con conexión inestable: si no hay señal, el
  reporte se guarda en el dispositivo y se envía automáticamente al recuperar conexión.
- **Backoffice** (`/backoffice`): consolida todos los reportes en tabla, mapa y dashboard de
  totales agregados, con tracking del estado de cada necesidad (pendiente / en proceso /
  cubierto) y de cada reporte.

## ⚠️ Seguridad: el backoffice no tiene autenticación

Por decisión explícita para acelerar este MVP, **`/backoffice` no tiene login** y expone datos
de contacto (nombre, teléfono) de las personas que reportan. **Antes de compartir la URL de
producción ampliamente o de dejarla corriendo por un período prolongado**, agrega autenticación
(por ejemplo Vercel Password Protection, HTTP Basic Auth vía `middleware.ts`, o un proveedor
como NextAuth/Clerk). Mientras tanto, evita publicar la URL del backoffice en canales públicos.

## Requisitos

- Node.js 20+
- Docker (para levantar Postgres en local) — o una connection string de Postgres ya existente.

## Setup local

```bash
npm install
cp .env.example .env

# Levanta Postgres local en Docker (puerto 5433, para no chocar con otros proyectos)
docker compose up -d

npx prisma migrate dev

npm run dev
```

Abre [http://localhost:3000/reportar](http://localhost:3000/reportar) para el formulario público
y [http://localhost:3000/backoffice](http://localhost:3000/backoffice) para el panel consolidado.

### Fotos en desarrollo local

Si `BLOB_READ_WRITE_TOKEN` está vacío en `.env`, las fotos subidas se guardan localmente en
`/public/uploads` (fallback de desarrollo, ver `src/app/api/photos/upload/route.ts`). En
producción, configura una [Vercel Blob store](https://vercel.com/docs/storage/vercel-blob) y su
token para que las fotos se guarden ahí.

## Stack

- **Next.js 16 (App Router, TypeScript, Tailwind)** — un solo proyecto, front + backoffice + API.
- **Prisma + PostgreSQL** — ver modelo de datos en `prisma/schema.prisma` (`Report`, `NeedItem`,
  `Photo`).
- **Leaflet + react-leaflet + OpenStreetMap** para captura y visualización de ubicación (sin API
  key).
- **react-hook-form + zod** para el formulario (`src/lib/validation.ts`, compartido entre
  cliente y servidor).
- **IndexedDB (`idb`) + un service worker escrito a mano** (`public/sw.js`) para el soporte
  offline del formulario público. No se usa `next-pwa`/Workbox porque dependen de un plugin de
  webpack incompatible con Turbopack (motor por defecto de Next.js 16).
- **Server Actions** (`src/actions/reports.ts`) para las actualizaciones del backoffice; el
  formulario público envía a través de una API route (`/api/reports`) porque debe ser invocable
  desde la cola offline con reintentos (upsert por `clientId` para evitar duplicados).

## Cómo funciona el flujo offline

1. Al enviar el formulario, el reporte (y las fotos, como `Blob`) se guardan primero en
   IndexedDB (`src/offline/db.ts`, `src/offline/queue.ts`) con un `clientId` generado en el
   cliente.
2. Inmediatamente se intenta sincronizar: subir fotos y luego `POST /api/reports`.
3. Si no hay conexión, el reporte queda `queued` y se reintenta automáticamente al detectar el
   evento `online` (con un polling de respaldo cada 30s, ya que el evento no siempre es confiable
   en móviles).
4. El servidor deduplica por `clientId`, así que los reintentos nunca crean reportes repetidos.

**Para probarlo:** abre `/reportar`, DevTools → Network → *Offline*, llena y envía el
formulario. Debe verse el aviso "guardado en tu dispositivo" y el registro debe aparecer en
DevTools → Application → IndexedDB → `eco-reports`. Al volver a poner la red en *Online*, el
reporte debe sincronizarse solo y aparecer en `/backoffice/tabla`.

## Deploy

1. Base de datos Postgres administrada (ej. [Neon](https://neon.tech)) → `DATABASE_URL`.
2. [Vercel Blob store](https://vercel.com/docs/storage/vercel-blob) → `BLOB_READ_WRITE_TOKEN`.
3. Desplegar en Vercel; correr `npx prisma migrate deploy` contra la base de producción (puede
   agregarse como build step).
4. Ver la nota de seguridad arriba antes de compartir la URL del backoffice.
