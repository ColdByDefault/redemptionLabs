import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmailOrUsername, verifyPassword } from "@/lib/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const identifier = credentials.identifier as string;
        const password = credentials.password as string;

        const user = await getUserByEmailOrUsername(identifier);
        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(password, user.hashedPassword);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          enabledPlugins: user.enabledPlugins,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.enabledPlugins = user.enabledPlugins;
      }

      // Handle session update (e.g., when plugins change)
      if (trigger === "update" && session?.enabledPlugins) {
        token.enabledPlugins = session.enabledPlugins;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.enabledPlugins = token.enabledPlugins as string[];
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
