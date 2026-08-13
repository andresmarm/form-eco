-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('NUEVO', 'EN_REVISION', 'EN_PROCESO', 'ATENDIDO', 'CERRADO');

-- CreateEnum
CREATE TYPE "NeedItemStatus" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'CUBIERTO');

-- CreateEnum
CREATE TYPE "NeedCategory" AS ENUM ('MATERIALES_CONSTRUCCION', 'ALIMENTOS_AGUA', 'MEDICAMENTOS_INSUMOS_MEDICOS', 'HERRAMIENTAS', 'REFUGIO_TEMPORAL', 'SERVICIOS', 'OTRO');

-- CreateEnum
CREATE TYPE "LocationSource" AS ENUM ('GPS', 'MANUAL');

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT,
    "contactName" TEXT NOT NULL,
    "phonePrimary" TEXT NOT NULL,
    "phoneAlternate" TEXT,
    "locationSource" "LocationSource" NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" TEXT,
    "municipality" TEXT NOT NULL,
    "neighborhood" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'NUEVO',
    "internalNotes" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeedItem" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "category" "NeedCategory" NOT NULL,
    "itemKey" TEXT NOT NULL,
    "itemLabel" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "status" "NeedItemStatus" NOT NULL DEFAULT 'PENDIENTE',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NeedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Report_clientId_key" ON "Report"("clientId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_municipality_idx" ON "Report"("municipality");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "NeedItem_reportId_idx" ON "NeedItem"("reportId");

-- CreateIndex
CREATE INDEX "NeedItem_category_idx" ON "NeedItem"("category");

-- CreateIndex
CREATE INDEX "NeedItem_status_idx" ON "NeedItem"("status");

-- CreateIndex
CREATE INDEX "Photo_reportId_idx" ON "Photo"("reportId");

-- AddForeignKey
ALTER TABLE "NeedItem" ADD CONSTRAINT "NeedItem_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
