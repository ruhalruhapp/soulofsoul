import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { convex, api } from "@/lib/db";

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

    // §5.6: 18+ hard gate
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

    const passwordHash = await bcrypt.hash(password, 12);

    // Call Convex mutation
    const result = await convex.mutation(api.mutations.createUser, {
      email,
      passwordHash,
      name: body.name,
      role: "MEMBER",
      ageVerified: true,
      birthYear,
      tier: 1,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/auth/register] error:", msg);
    if (msg.includes("already registered")) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
