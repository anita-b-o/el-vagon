import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isAllowedAdminProfile } from "@/lib/domain/admin-auth";

const secure = process.env.NODE_ENV === "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  cookies: {
    sessionToken: {
      name: secure ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure,
      },
    },
  },
  callbacks: {
    signIn({ account, profile }) {
      if (account?.provider !== "google") return false;
      return isAllowedAdminProfile(
        profile as { email?: string | null; email_verified?: boolean } | undefined,
      );
    },
    authorized({ auth: session }) {
      return Boolean(session?.user?.email && isAllowedAdminProfile({
        email: session.user.email,
        email_verified: true,
      }));
    },
  },
});
