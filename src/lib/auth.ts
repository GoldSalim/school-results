import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { db } from './db';

const credentialsSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: { identifier: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { identifier, password } = parsed.data;

        let user = null;

        if (identifier.includes('@')) {
          user = await db.user.findUnique({
            where: { email: identifier.toLowerCase() },
          });
        } else {
          // Search case-insensitively and trim spaces
          const student = await db.student.findFirst({
            where: { 
              admissionNo: {
                equals: identifier.trim(),
                mode: 'insensitive'
              }
            },
            include: { user: true }
          });
          user = student?.user || null;
        }

        if (!user || !user.isActive) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email || '',
          name: user.name,
          role: user.role,
          schoolId: user.schoolId ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.schoolId = (user as any).schoolId;
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).role = token.role;
        (session.user as any).schoolId = token.schoolId;
      }
      return session;
    },
  },
});