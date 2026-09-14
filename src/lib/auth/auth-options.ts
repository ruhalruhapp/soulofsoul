import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * NextAuth.js configuration — soulofsoul platform.
 *
 * Role-based access control (RBAC):
 *   MEMBER      → Tier 1-3 user (self-guided wellness, peer, AI companion)
 *   CLINICIAN   → Tier 4 provider (telehealth, Smart Notes, Smart Insights)
 *   SUPERVISOR  → Persona D — crisis queue triage, disposition authority
 *   ADMIN       → Enterprise contracts, aggregate reporting, SLA monitoring
 *   RESEARCHER  → Pillar 2 IRB-supervised aggregate review (no individual data)
 *
 * Per §5.6: age verification (18+) is a hard product gate.
 * Per §8.3: consent state is layered (4 separate streams) and tracked per User.
 */

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        // Soft-deleted accounts cannot log in (§9 retention)
        if (user.deletedAt) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-change-in-production",
};

// Role-checking helpers for use in API routes and server components
export type Role = "MEMBER" | "CLINICIAN" | "SUPERVISOR" | "ADMIN" | "RESEARCHER";

export function hasRole(session: { user?: { role?: string } } | null, ...roles: Role[]): boolean {
  if (!session?.user?.role) return false;
  return roles.includes(session.user.role as Role);
}

export function requireRole(session: { user?: { role?: string } } | null, ...roles: Role[]): void {
  if (!hasRole(session, ...roles)) {
    throw new Error("Forbidden: insufficient role");
  }
}
