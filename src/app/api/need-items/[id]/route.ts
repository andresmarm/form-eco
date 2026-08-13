import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateNeedItemStatusSchema } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const json = await req.json();
  const parsed = updateNeedItemStatusSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const needItem = await prisma.needItem.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ needItem });
}
