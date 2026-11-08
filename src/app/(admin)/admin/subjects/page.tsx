import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SubjectForm from './subject-form';

export default async function SubjectsPage() {
  const { schoolId } = await requireAdmin();

  const subjects = await db.subject.findMany({
    where: { schoolId },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">Subjects</h1>
        <p className="text-sm text-slate-500">Manage the subjects offered by your school.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-slate-200 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Add New Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectForm />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Subject List ({subjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No subjects created yet.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Subject Name</th>
                    <th className="px-4 py-3 font-medium">Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-slate-500">{s.code || '-'}</td>
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