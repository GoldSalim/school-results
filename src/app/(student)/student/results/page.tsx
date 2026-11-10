export const instant = false;

import { requireStudent } from '@/lib/rbac';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function StudentResultsPage() {
  const { student } = await requireStudent();

  const results = await db.result.findMany({
    where: { studentId: student.id, status: 'PUBLISHED' },
    include: {
      term: { include: { session: true } },
      scores: { include: { subject: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1F44]">My Results</h1>
        <p className="text-sm text-slate-500">View and print your published terminal reports.</p>
      </div>

      {results.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">Your results are not available yet.</p>
            <p className="text-sm text-slate-400 mt-1">Please check back when your school publishes them.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {results.map((result) => {
            const totalScore = result.scores.reduce((acc, curr) => acc + curr.total, 0);
            const average = result.scores.length > 0 ? (totalScore / result.scores.length).toFixed(1) : '0';
            
            return (
              <Card key={result.id} className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>{result.term.session.name} - {result.term.name}</CardTitle>
                  <a 
                    href={`/api/report-card/${result.id}`} 
                    target="_blank"
                    className="text-sm bg-[#0A1F44] text-white px-4 py-2 rounded text-center hover:bg-opacity-90 transition w-full md:w-auto"
                  >
                    Download PDF
                  </a>
                </CardHeader>
                <CardContent className="p-0">
                  
                  {/* Scrollable table container */}
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left whitespace-nowrap min-w-[600px]">
                      <thead className="bg-white text-slate-500 border-b">
                        <tr>
                          <th className="px-6 py-3 font-medium">Subject</th>
                          <th className="px-6 py-3 font-medium">1st CA</th>
                          <th className="px-6 py-3 font-medium">2nd CA</th>
                          <th className="px-6 py-3 font-medium">3rd CA</th>
                          <th className="px-6 py-3 font-medium">Exam</th>
                          <th className="px-6 py-3 font-medium">Total</th>
                          <th className="px-6 py-3 font-medium">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {result.scores.map((score) => (
                          <tr key={score.id} className="hover:bg-slate-50">
                            <td className="px-6 py-3 font-medium">{score.subject.name}</td>
                            <td className="px-6 py-3">{score.firstCA}</td>
                            <td className="px-6 py-3">{score.secondCA}</td>
                            <td className="px-6 py-3">{score.thirdCA}</td>
                            <td className="px-6 py-3">{score.exam}</td>
                            <td className="px-6 py-3 font-bold">{score.total}</td>
                            <td className="px-6 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                score.grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                                score.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                                score.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-700' :
                                score.grade.startsWith('D') || score.grade.startsWith('E') ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {score.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t font-bold">
                        <tr>
                          <td className="px-6 py-3" colSpan={5}>Overall Average</td>
                          <td className="px-6 py-3" colSpan={2}>{average}%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="bg-white p-6 border-t space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-[#0A1F44]">Class Teacher's Remark:</p>
                      <p className="text-sm text-slate-600">{result.teacherRemark || 'No remark provided.'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0A1F44]">Principal's Remark:</p>
                      <p className="text-sm text-slate-600">{result.principalRemark || 'No remark provided.'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}