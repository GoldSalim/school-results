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
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">Students</h1>
        <p className="text-sm text-slate-500">Manage student records and admission numbers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200 shadow-sm h-fit">
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
        </div>

        {/* List Column */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Student Directory ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No students registered yet.</p>
              ) : (
                <div className="divide-y">
                  {/* Header (Hidden on mobile) */}
                  <div className="hidden md:grid grid-cols-5 gap-4 py-3 text-sm font-medium text-slate-500 bg-slate-50 px-4">
                    <div className="col-span-2">Name</div>
                    <div>Admission No.</div>
                    <div>Class</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {/* Rows (Stacked cards on mobile) */}
                  {students.map((student) => (
                    <div key={student.id} className="flex flex-col md:grid md:grid-cols-5 gap-2 md:gap-4 py-4 px-4 hover:bg-slate-50 transition-colors">
                      
                      {/* Mobile Header: Name & Status */}
                      <div className="md:col-span-2 flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-[#0A1F44]">{student.fullName}</div>
                          <div className="text-xs text-slate-500 md:hidden mt-1">{student.admissionNo}</div>
                        </div>
                        <div className="md:hidden">
                          {student.userId ? (
                            <span className="text-[10px] font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">Active</span>
                          ) : (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">Pending</span>
                          )}
                        </div>
                      </div>

                      {/* Desktop Admission No & Class */}
                      <div className="hidden md:block text-sm text-slate-600 self-center">{student.admissionNo}</div>
                      <div className="hidden md:block text-sm text-slate-600 self-center">{student.class.name}</div>

                      {/* Desktop Status */}
                      <div className="hidden md:flex items-center">
                        {student.userId ? (
                          <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">Active</span>
                        ) : (
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">Pending</span>
                        )}
                      </div>

                      {/* Actions (Mobile: Full width below, Desktop: Right aligned) */}
                      <div className="flex items-center justify-end mt-2 md:mt-0">
                        <StudentActions student={student} classes={classes} />
                      </div>
                      
                      {/* Mobile Class view */}
                      <div className="md:hidden text-xs text-slate-500">
                        Class: <span className="font-medium text-slate-700">{student.class.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}