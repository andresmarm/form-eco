import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { reportInputSchema } from "@/lib/validation";
import { buildReportWhere, parseReportFilters } from "@/lib/report-filters";

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = reportInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const existing = await prisma.report.findUnique({
    where: { clientId: data.clientId },
    include: { needItems: true, photos: true },
  });
  if (existing) {
    return NextResponse.json({ report: existing, deduped: true }, { status: 200 });
  }

  try {
    const report = await prisma.report.create({
      data: {
        clientId: data.clientId,
        contactName: data.contactName,
        phonePrimary: data.phonePrimary,
        phoneAlternate: data.phoneAlternate || null,
        locationSource: data.locationSource,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address || null,
        municipality: data.municipality,
        neighborhood: data.neighborhood || null,
        needItems: {
          create: data.needItems.map((item) => ({
            category: item.category,
            itemKey: item.itemKey,
            itemLabel: item.itemLabel,
            quantity: item.quantity,
            unit: item.unit,
            note: item.note || null,
          })),
        },
        photos: {
          create: data.photoUrls.map((url) => ({ url })),
        },
      },
      include: { needItems: true, photos: true },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    // Condicion de carrera: dos reintentos concurrentes con el mismo clientId
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const existingAfterRace = await prisma.report.findUnique({
        where: { clientId: data.clientId },
        include: { needItems: true, photos: true },
      });
      return NextResponse.json({ report: existingAfterRace, deduped: true }, { status: 200 });
    }
    throw err;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filters = parseReportFilters(Object.fromEntries(searchParams.entries()));
  const where = buildReportWhere(filters);

  const reports = await prisma.report.findMany({
    where,
    include: { needItems: true, photos: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reports });
}
