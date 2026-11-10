import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SettingsForm from './settings-form';

export default async function SettingsPage() {
  const { schoolId } = await requireAdmin();

  const school = await db.school.findUnique({
    where: { id: schoolId },
  });

  if (!school) return <p>School not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">Settings</h1>
        <p className="text-sm text-slate-500">Manage your school's profile information.</p>
      </div>

      <div className="max-w-2xl">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="px-4 md:px-6">
            <CardTitle>School Profile</CardTitle>
            <CardDescription>
              This information will appear on the students' report cards.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <SettingsForm school={school} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}