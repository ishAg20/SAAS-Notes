import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRequest, requireRole } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { payload } = await authenticateRequest(request);
    requireRole(["ADMIN"])(payload);
    if (payload.tenantSlug !== params.slug)
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    const tenant = await prisma.tenant.findUnique({
      where: { slug: params.slug },
    });
    if (!tenant)
      return NextResponse.json(
        { success: false, error: "Tenant not found" },
        { status: 404 }
      );
    if (tenant.subscription === "PRO")
      return NextResponse.json(
        { success: false, error: "Already Pro" },
        { status: 400 }
      );
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { subscription: "PRO" },
    });
    return NextResponse.json(
      { success: true, data: updatedTenant, message: "Upgraded." },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
    ) {
      const message = (error as { message: string }).message;
      if (message === "No token provided" || message === "Invalid token")
        return NextResponse.json(
          { success: false, error: "Auth required" },
          { status: 401 }
        );
      if (message === "Insufficient permissions")
        return NextResponse.json(
          { success: false, error: "Admin only" },
          { status: 403 }
        );
    }
    return NextResponse.json(
      { success: false, error: "Upgrade failed" },
      { status: 500 }
    );
  }
}
