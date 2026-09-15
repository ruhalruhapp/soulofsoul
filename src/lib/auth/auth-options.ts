import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { convex, api } from "@/lib/db";

/**
 * NextAuth.js configuration — soulofsoul platform.
 *
 * Uses Convex as the user store (replaces Prisma).
 * Role-based access control (RBAC): MEMBER, CLINICIAN, SUPERVISOR, ADMIN, RESEARCHER.
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

        // Query Convex for the user
        const user = await convex.query(api.queries.getUserByEmail, {
          email: credentials.email.toLowerCase(),
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        if (user.deletedAt) {
          return null;
        }

        return {
          id: user._id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
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
