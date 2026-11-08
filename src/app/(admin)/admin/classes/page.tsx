import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ClassForm from './class-form';
import ClassActions from './class-actions';

export default async function ClassesPage() {
  const { schoolId } = await requireAdmin();

  const classes = await db.class.findMany({
    where: { schoolId },
    include: { _count: { select: { students: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">Classes</h1>
        <p className="text-sm text-slate-500">Manage school classes and arms.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-slate-200 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Add New Class</CardTitle>
          </CardHeader>
          <CardContent>
            <ClassForm />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Class List ({classes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No classes created yet.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Class Name</th>
                    <th className="px-4 py-3 font-medium">Level</th>
                    <th className="px-4 py-3 font-medium">Students</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {classes.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-slate-500">{c.level || '-'}</td>
                      <td className="px-4 py-3">{c._count.students}</td>
                      <td className="px-4 py-3 text-right">
                        <ClassActions cls={c} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}