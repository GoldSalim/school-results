export const instant = false;

import { requireAdmin } from '@/lib/rbac';
import AdminSidebar from '@/components/admin-sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      {/* pt-20 for mobile top bar, md:ml-64 for desktop sidebar */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}