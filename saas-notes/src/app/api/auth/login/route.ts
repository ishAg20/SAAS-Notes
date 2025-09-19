/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { comparePasswords, generateToken } from "@/lib/auth";
import { LoginRequest, LoginResponse, User } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });
    if (!user)
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid)
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "MEMBER",
      tenantId: user.tenantId,
      tenantSlug: user.tenant.slug,
    };
    const token = generateToken(tokenPayload);
    const { password: _password, ...userResponse } = user;
    const response: LoginResponse = {
      user: userResponse as Omit<User, "password">,
      token,
      message: "Login successful",
    };
    return NextResponse.json(
      { success: true, data: response },
      { status: 200 }
    );
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
