import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || "liv-app-dev",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
      issuer:
        process.env.KEYCLOAK_ISSUER ||
        `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.keycloakId = profile?.sub;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).keycloakId = token.keycloakId;
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        // Sync Keycloak user to local DB
        if (profile?.sub) {
          await prisma.user.upsert({
            where: { keycloakId: profile.sub },
            update: {
              email: user.email || "",
              displayName: user.name || null,
              avatarUrl: user.image || null,
              lastLoginAt: new Date(),
            },
            create: {
              keycloakId: profile.sub,
              username:
                (profile as any).preferred_username ||
                user.email?.split("@")[0] ||
                "user",
              email: user.email || "",
              displayName: user.name || null,
              avatarUrl: user.image || null,
              role: "VISITOR",
              lastLoginAt: new Date(),
            },
          });

          // User synced to DB
        }
        return true;
      } catch (error) {
        console.error("Error syncing user to DB:", error);
        // Still allow login even if DB sync fails
        return true;
      }
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);
