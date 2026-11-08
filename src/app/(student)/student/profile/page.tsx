export const instant = false;

import { db } from '@/lib/db';
import { requireStudent } from '@/lib/rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, BookOpen, ShieldCheck } from 'lucide-react';

export default async function StudentProfilePage() {
  const { student } = await requireStudent();

  const studentWithClass = await db.student.findUnique({
    where: { id: student.id },
    include: { 
      class: true, 
      user: true 
    }
  });

  if (!studentWithClass) {
    return <p className="text-red-500">Student record not found.</p>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">My Profile</h1>
        <p className="text-sm text-slate-500">View your personal and academic information.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-[#0A1F44]" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Full Name</p>
              <p className="font-semibold text-lg text-[#0A1F44]">{studentWithClass.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Admission Number</p>
              <p className="font-medium">{studentWithClass.admissionNo}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email Address</p>
              <p className="font-medium">{studentWithClass.user?.email?.endsWith('@student.local') ? 'Not required (Login via Admission No)' : studentWithClass.user?.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-[#0A1F44]" />
              Academic Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Current Class</p>
              <p className="font-medium">{studentWithClass.class.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Class Level</p>
              <p className="font-medium">{studentWithClass.class.level || 'N/A'}</p>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                <ShieldCheck className="h-4 w-4" />
                Verified Account
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}