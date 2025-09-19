import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";
import { UpdateNoteRequest } from "@/types";

// Get note
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { payload } = await authenticateRequest(request);
  const note = await prisma.note.findFirst({
    where: { id: params.id, tenantId: payload.tenantId },
    include: { user: { select: { email: true } } },
  });
  if (!note)
    return NextResponse.json(
      { success: false, error: "Note not found" },
      { status: 404 }
    );
  return NextResponse.json({ success: true, data: note }, { status: 200 });
}

// Update note
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { payload } = await authenticateRequest(request);
  const body: UpdateNoteRequest = await request.json();
  const existingNote = await prisma.note.findFirst({
    where: { id: params.id, tenantId: payload.tenantId },
  });
  if (!existingNote)
    return NextResponse.json(
      { success: false, error: "Note not found" },
      { status: 404 }
    );
  const note = await prisma.note.update({
    where: { id: params.id },
    data: body,
    include: { user: { select: { email: true } } },
  });
  return NextResponse.json({ success: true, data: note }, { status: 200 });
}

// Delete note
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const { payload } = await authenticateRequest(request);
  const existingNote = await prisma.note.findFirst({
    where: { id: params.id, tenantId: payload.tenantId },
  });
  if (!existingNote)
    return NextResponse.json(
      { success: false, error: "Note not found" },
      { status: 404 }
    );
  await prisma.note.delete({ where: { id: params.id } });
  return NextResponse.json(
    { success: true, message: "Note deleted" },
    { status: 200 }
  );
}
