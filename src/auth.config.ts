import type { NextAuthConfig } from "next-auth";

// Lightweight config used by Edge middleware — no Prisma, no bcrypt
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // credentials provider requires Node.js, handled in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      if (isAdminRoute) return isLoggedIn;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
