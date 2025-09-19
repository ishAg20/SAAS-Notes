import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest, checkSubscriptionLimit } from "@/lib/auth";
import { CreateNoteRequest } from "@/types";

// List notes
export async function GET(request: NextRequest) {
  try {
    const { payload } = await authenticateRequest(request);
    const notes = await prisma.note.findMany({
      where: { tenantId: payload.tenantId },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: notes }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
// Create note
export async function POST(request: NextRequest) {
  try {
    const { payload } = await authenticateRequest(request);
    const body: CreateNoteRequest = await request.json();
    const { title, content } = body;
    if (!title || !content)
      return NextResponse.json(
        { success: false, error: "Title and content required" },
        { status: 400 }
      );
    // Enforce subscription
    const subscriptionCheck = await checkSubscriptionLimit(payload.tenantId);
    if (!subscriptionCheck.canCreateNote)
      return NextResponse.json(
        {
          success: false,
          error: "Note limit reached. Upgrade to Pro.",
          data: subscriptionCheck,
        },
        { status: 403 }
      );
    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: payload.userId,
        tenantId: payload.tenantId,
      },
      include: { user: { select: { email: true } } },
    });
    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create note" },
      { status: 500 }
    );
  }
}
