import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PublishButton from './publish-button';

export default async function ManageResultsPage() {
  const { schoolId } = await requireAdmin();

  const results = await db.result.findMany({
    where: { schoolId, status: 'DRAFT' },
    include: {
      student: true,
      class: true,
      term: { include: { session: true } },
      scores: { include: { subject: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">Manage Results</h1>
        <p className="text-sm text-slate-500">Review draft results before publishing them to students.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Draft Results ({results.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No draft results found.</p>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{result.student.fullName}</h3>
                      <p className="text-sm text-slate-500">
                        {result.class.name} • {result.term.session.name} - {result.term.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-50 text-yellow-700 border-yellow-200">
                        Draft
                      </span>
                      <PublishButton resultId={result.id} />
                    </div>
                  </div>

                  <table className="w-full text-sm text-left border-t pt-2 mt-2">
                    <thead className="text-slate-500">
                      <tr>
                        <th className="py-2 font-medium">Subject</th>
                        <th className="py-2 font-medium">1st CA</th>
                        <th className="py-2 font-medium">2nd CA</th>
                        <th className="py-2 font-medium">Exam</th>
                        <th className="py-2 font-medium">Total</th>
                        <th className="py-2 font-medium">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {result.scores.map((score) => (
                        <tr key={score.id}>
                          <td className="py-2">{score.subject.name}</td>
                          <td className="py-2">{score.firstCA}</td>
                          <td className="py-2">{score.secondCA}</td>
                          <td className="py-2">{score.exam}</td>
                          <td className="py-2 font-medium">{score.total}</td>
                          <td className="py-2">{score.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}