import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { AuthToken } from "@/types";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: AuthToken): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken;
  } catch (error) {
    return null;
  }
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

export async function authenticateRequest(request: NextRequest) {
  const token = extractTokenFromRequest(request);

  if (!token) throw new Error("No token provided");

  const payload = verifyToken(token);
  if (!payload) throw new Error("Invalid token");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { tenant: true },
  });

  if (!user) throw new Error("User not found");
  return { user, payload };
}

export function requireRole(roles: string[]) {
  return (payload: AuthToken) => {
    if (!roles.includes(payload.role))
      throw new Error("Insufficient permissions");
  };
}

export async function checkSubscriptionLimit(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { _count: { select: { notes: true } } },
  });

  if (!tenant) throw new Error("Tenant not found");

  const isProPlan = tenant.subscription === "PRO";
  const currentCount = tenant._count.notes;
  const limit = isProPlan ? null : 3;
  const canCreateNote = isProPlan || currentCount < 3;

  return {
    canCreateNote,
    currentCount,
    limit,
    subscription: tenant.subscription,
  };
}
