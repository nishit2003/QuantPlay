import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // Keep non-credentials providers from shared config
    ...authConfig.providers.filter(
      (p) => (p as { type?: string }).type !== "credentials"
    ),
    // Override Credentials with the real authorize function (needs Prisma)
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginToken: { label: "Login token", type: "text" },
      },
      async authorize(credentials) {
        // One-time login token (after email verification)
        const token = credentials?.loginToken as string | undefined;
        if (token?.trim()) {
          const vt = await prisma.verificationToken.findUnique({
            where: { token: token.trim() },
          });
          if (vt && new Date() < vt.expires && vt.identifier) {
            await prisma.verificationToken.delete({ where: { token: vt.token } }).catch(() => {});
            const user = await prisma.user.findUnique({
              where: { id: vt.identifier },
              select: { id: true, email: true, name: true },
            });
            if (user) return { id: user.id, email: user.email, name: user.name };
          }
          return null;
        }

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
});
