import { auth } from './auth';
import { db } from './db';
import { redirect } from 'next/navigation';

export class AuthError extends Error {
  constructor(public code: 'UNAUTHENTICATED' | 'FORBIDDEN', message?: string) {
    super(message ?? code);
  }
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  
  const role = (session.user as any).role;
  const schoolId = (session.user as any).schoolId as string | undefined;
  
  if (role !== 'ADMIN' || !schoolId) {
    redirect('/login'); // Or redirect to a "not authorized" page
  }
  
  return { userId: (session.user as any).id as string, schoolId };
}

export async function requireStudent() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  
  const role = (session.user as any).role;
  if (role !== 'STUDENT') {
    redirect('/login');
  }
  
  const userId = (session.user as any).id as string;
  const student = await db.student.findUnique({ where: { userId } });
  
  if (!student || !student.isVerified) {
    redirect('/login');
  }
  
  return { userId, student };
}