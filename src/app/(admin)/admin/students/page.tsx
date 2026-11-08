import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentForm from './student-form';
import StudentActions from './student-actions';

export default async function StudentsPage() {
  const { schoolId } = await requireAdmin();

  const [students, classes] = await Promise.all([
    db.student.findMany({
      where: { schoolId },
      include: { class: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.class.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F44]">Students</h1>
          <p className="text-sm text-slate-500">Manage student records and admission numbers.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-slate-200 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Add New Student</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentForm classes={classes} />
            {classes.length === 0 && (
              <p className="text-xs text-red-500 mt-4 text-center">
                You must create a class first before adding students.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Student Directory ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No students registered yet.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Admission No.</th>
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#0A1F44]">{student.fullName}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">{student.admissionNo}</td>
                      <td className="px-4 py-3">{student.class.name}</td>
                      <td className="px-4 py-3">
                        {student.userId ? (
                          <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">Active</span>
                        ) : (
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">Pending Setup</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <StudentActions student={student} classes={classes} />
                        </div>
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