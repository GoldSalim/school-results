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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-slate-200 shadow-sm h-fit">
            <CardHeader>
              <CardTitle>Add New Class</CardTitle>
            </CardHeader>
            <CardContent>
              <ClassForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Class List ({classes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No classes created yet.</p>
              ) : (
                <div className="divide-y">
                  {/* Header */}
                  <div className="hidden md:grid grid-cols-4 gap-4 py-3 text-sm font-medium text-slate-500 bg-slate-50 px-4">
                    <div>Class Name</div>
                    <div>Level</div>
                    <div>Students</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {/* Rows */}
                  {classes.map((c) => (
                    <div key={c.id} className="flex flex-col md:grid md:grid-cols-4 gap-2 md:gap-4 py-4 px-4 hover:bg-slate-50 transition-colors">
                      
                      <div className="flex justify-between items-center md:block">
                        <div className="font-semibold text-[#0A1F44]">{c.name}</div>
                        <div className="md:hidden">
                           <ClassActions cls={c} />
                        </div>
                      </div>
                      
                      <div className="hidden md:block text-sm text-slate-600 self-center">{c.level || '-'}</div>
                      <div className="hidden md:block text-sm text-slate-600 self-center">{c._count.students} students</div>

                      <div className="hidden md:flex items-center justify-end">
                        <ClassActions cls={c} />
                      </div>

                      <div className="md:hidden flex gap-4 text-xs text-slate-500">
                        <span>Level: {c.level || 'N/A'}</span>
                        <span>•</span>
                        <span>Students: {c._count.students}</span>
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