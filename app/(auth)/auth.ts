import { compare } from "bcrypt-ts";
import NextAuth, { User, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { dbWithSchema as db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema/users";
import { authConfig } from "./auth.config";

interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        if (!email || !password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email)
        });

        if (!user) return null;

        const passwordMatch = await compare(password, user.password);
        if (passwordMatch) return user;

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: ExtendedSession, token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
});