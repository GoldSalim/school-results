import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { Card, CardContent } from '@/components/ui/card';
import BulkUploadForm from './bulk-upload-form';

export default async function UploadResultsPage() {
  const { schoolId } = await requireAdmin();

  const [classes, subjects, terms] = await Promise.all([
    db.class.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
    db.subject.findMany({ where: { schoolId }, orderBy: { name: 'asc' } }),
    db.term.findMany({ 
      where: { session: { schoolId } }, 
      include: { session: true },
      orderBy: { createdAt: 'desc' } 
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">Bulk Result Upload</h1>
        <p className="text-sm text-slate-500">Select a class to load students, then enter scores for all subjects at once.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <BulkUploadForm classes={classes} subjects={subjects} terms={terms} />
        </CardContent>
      </Card>
    </div>
  );
}