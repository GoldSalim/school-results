export const instant = false;

import { requireStudent } from '@/lib/rbac';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function StudentDashboard() {
  const { student } = await requireStudent();

  const latestResult = await db.result.findFirst({
    where: { studentId: student.id, status: 'PUBLISHED' },
    include: { term: { include: { session: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">Dashboard Overview</h1>
        <p className="text-sm text-slate-500">Welcome to your student portal.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-slate-500">Name:</span> <span className="font-medium">{student.fullName}</span></p>
            <p><span className="text-slate-500">Admission No:</span> <span className="font-medium">{student.admissionNo}</span></p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Result Status</CardTitle>
          </CardHeader>
          <CardContent>
            {latestResult ? (
              <div>
                <p className="text-sm text-green-600 font-medium mb-2">✓ Your latest results are available!</p>
                <p className="text-sm text-slate-500 mb-4">{latestResult.term.session.name} - {latestResult.term.name}</p>
                <Link href="/student/results" className="inline-flex bg-[#0A1F44] text-white px-4 py-2 rounded text-sm font-medium hover:bg-opacity-90 transition">
                  View Results
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-500">Your results are not available yet.</p>
                <p className="text-xs text-slate-400 mt-1">Please check back when your school publishes them.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}