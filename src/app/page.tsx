export const instant = false;

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login'); // Student Login
  }
  
  const role = (session.user as any).role;
  
  if (role === 'ADMIN') {
    redirect('/admin/dashboard');
  } else {
    redirect('/student/dashboard');
  }
}