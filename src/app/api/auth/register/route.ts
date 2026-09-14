import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const runtime = "nodejs";

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  birthYear: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterRequest;
    const email = body.email?.toLowerCase().trim();
    const password = body.password;
    const birthYear = body.birthYear;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    if (!birthYear || birthYear < 1900 || birthYear > new Date().getFullYear()) {
      return NextResponse.json({ error: "Valid birth year required" }, { status: 400 });
    }
    const age = new Date().getFullYear() - birthYear;
    if (age < 18) {
      return NextResponse.json(
        { error: "You must be 18 or older to use soulofsoul." },
        { status: 403 }
      );
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        name: body.name,
        passwordHash,
        role: "MEMBER",
        ageVerified: true,
        birthYear,
        tier: 1,
        member: {
          create: {
            language: "en",
          },
        },
      },
      select: { id: true, email: true, role: true },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "auth:register",
        ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email, role: user.role });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/auth/register] error:", msg);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
