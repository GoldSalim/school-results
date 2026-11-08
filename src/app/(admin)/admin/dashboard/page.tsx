import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, FileText, CheckCircle, Clock } from 'lucide-react';

export default async function AdminDashboardPage() {
  const { schoolId } = await requireAdmin();

  const [students, classes, subjects, published, drafts] = await Promise.all([
    db.student.count({ where: { schoolId } }),
    db.class.count({ where: { schoolId } }),
    db.subject.count({ where: { schoolId } }),
    db.result.count({ where: { schoolId, status: 'PUBLISHED' } }),
    db.result.count({ where: { schoolId, status: 'DRAFT' } }),
  ]);

  const stats = [
    { title: 'Total Students', value: students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Classes', value: classes, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Total Subjects', value: subjects, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Published Results', value: published, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Draft Results', value: drafts, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A1F44] tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back. Here is an overview of your school.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-[#0A1F44]">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50 rounded-t-xl">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/admin/results/upload" className="flex items-center gap-4 p-4 border rounded-xl hover:border-[#0A1F44] hover:bg-slate-50 transition-colors group">
            <div className="bg-[#0A1F44] p-3 rounded-lg text-white group-hover:scale-105 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-[#0A1F44]">Upload Results</h4>
              <p className="text-sm text-slate-500">Enter scores and generate reports.</p>
            </div>
          </a>
          <a href="/admin/students" className="flex items-center gap-4 p-4 border rounded-xl hover:border-[#0A1F44] hover:bg-slate-50 transition-colors group">
            <div className="bg-[#0A1F44] p-3 rounded-lg text-white group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-[#0A1F44]">Manage Students</h4>
              <p className="text-sm text-slate-500">Add new students or update records.</p>
            </div>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}