export const instant = false;

import { requireStudent } from '@/lib/rbac';
import StudentSidebar from '@/components/student-sidebar';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { student } = await requireStudent();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StudentSidebar studentName={student.fullName} admissionNo={student.admissionNo} />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}