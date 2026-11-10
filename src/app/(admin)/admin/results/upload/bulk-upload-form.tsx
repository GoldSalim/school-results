'use client';

import { useState, useEffect } from 'react';
import { saveBulkResults } from '@/server/actions/results';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

type Class = { id: string; name: string };
type Subject = { id: string; name: string };
type Term = { id: string; name: string; session: { name: string } };
type Student = { id: string; fullName: string; admissionNo: string };

type ScoreEntry = { firstCA: string, secondCA: string, thirdCA: string, exam: string };
type StudentData = { scores: Record<string, ScoreEntry>, teacherRemark: string, principalRemark: string };
type ScoresState = Record<string, StudentData>;

export default function BulkUploadForm({ classes, subjects, terms }: { classes: Class[], subjects: Subject[], terms: Term[] }) {
  const router = useRouter();
  const [classId, setClassId] = useState('');
  const [termId, setTermId] = useState('');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<ScoresState>({});
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  useEffect(() => {
    if (!classId) {
      setStudents([]); setScores({}); return;
    }
    setFetching(true);
    fetch(`/api/admin/students?classId=${classId}`)
      .then(res => res.json())
      .then((data: Student[]) => {
        setStudents(data);
        const initialScores: ScoresState = {};
        data.forEach((student) => {
          initialScores[student.id] = { scores: {}, teacherRemark: '', principalRemark: '' };
          subjects.forEach((subject) => {
            initialScores[student.id].scores[subject.id] = { firstCA: '', secondCA: '', thirdCA: '', exam: '' };
          });
        });
        setScores(initialScores);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [classId, subjects]);

  function getGrade(total: number) {
    if (total >= 75) return { grade: 'A1', remark: 'Excellent' };
    if (total >= 70) return { grade: 'B2', remark: 'Very Good' };
    if (total >= 65) return { grade: 'B3', remark: 'Good' };
    if (total >= 60) return { grade: 'C4', remark: 'Credit' };
    if (total >= 55) return { grade: 'C5', remark: 'Credit' };
    if (total >= 50) return { grade: 'C6', remark: 'Credit' };
    if (total >= 45) return { grade: 'D7', remark: 'Pass' };
    if (total >= 40) return { grade: 'E8', remark: 'Pass' };
    if (total > 0) return { grade: 'F9', remark: 'Fail' };
    return { grade: '-', remark: '-' };
  }

  function handleScoreChange(studentId: string, subjectId: string, field: keyof ScoreEntry, value: string) {
    let num = Number(value);
    if (field === 'firstCA' || field === 'secondCA' || field === 'thirdCA') { if (num > 10) value = '10'; }
    if (field === 'exam' && num > 70) value = '70';

    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        scores: {
          ...prev[studentId].scores,
          [subjectId]: { ...prev[studentId].scores[subjectId], [field]: value }
        }
      }
    }));
  }

  function handleRemarkChange(studentId: string, field: 'teacherRemark' | 'principalRemark', value: string) {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  }

  async function onSubmit() {
    if (!classId || !termId) {
      setMessage({ type: 'error', text: 'Please select both a Class and a Term.' });
      return;
    }
    setLoading(true); setMessage(null);

    const studentsData = students.map(student => {
      const studentData = scores[student.id] || { scores: {}, teacherRemark: '', principalRemark: '' };
      const formattedScores = Object.entries(studentData.scores).map(([subjectId, s]) => ({
        subjectId,
        firstCA: Number(s.firstCA) || 0,
        secondCA: Number(s.secondCA) || 0,
        thirdCA: Number(s.thirdCA) || 0,
        exam: Number(s.exam) || 0,
      }));
      return { 
        studentId: student.id, 
        scores: formattedScores,
        teacherRemark: studentData.teacherRemark,
        principalRemark: studentData.principalRemark
      };
    });

    const res = await saveBulkResults({ classId, termId, studentsData });

    if (res.error) setMessage({ type: 'error', text: res.error });
    else {
      setMessage({ type: 'success', text: 'All results saved successfully!' });
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Select Class</label>
          <select value={classId} onChange={e => setClassId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] appearance-auto">
            <option value="">Select Class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select Term</label>
          <select value={termId} onChange={e => setTermId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] appearance-auto">
            <option value="">Select Term...</option>
            {terms.map(t => <option key={t.id} value={t.id}>{t.session.name} - {t.name}</option>)}
          </select>
        </div>
      </div>

      {fetching && <div className="text-sm text-slate-500">Loading students...</div>}

      {classId && students.length > 0 && (
        <div className="space-y-6">
          {students.map(student => (
            <div key={student.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
              
              <div className="bg-[#0A1F44] text-white px-4 py-3 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{student.fullName}</h3>
                  <p className="text-xs text-slate-300">Adm No: {student.admissionNo}</p>
                </div>
              </div>

              {/* SCROLLABLE TABLE FOR MOBILE */}
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left whitespace-nowrap min-w-[600px]">
                  <thead className="bg-slate-50 text-slate-600 border-b">
                    <tr>
                      <th className="px-4 py-2 font-medium w-48">Subject</th>
                      <th className="px-2 py-2 font-medium text-center border-l">1st CA</th>
                      <th className="px-2 py-2 font-medium text-center">2nd CA</th>
                      <th className="px-2 py-2 font-medium text-center">3rd CA</th>
                      <th className="px-2 py-2 font-medium text-center">Exam</th>
                      <th className="px-2 py-2 font-bold text-center bg-slate-200 border-l">Total</th>
                      <th className="px-2 py-2 font-bold text-center bg-slate-200">Grade</th>
                      <th className="px-2 py-2 font-bold text-center bg-slate-200">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {subjects.map(subject => {
                      const s = scores[student.id]?.scores?.[subject.id] || { firstCA: '', secondCA: '', thirdCA: '', exam: '' };
                      const total = (Number(s.firstCA)||0) + (Number(s.secondCA)||0) + (Number(s.thirdCA)||0) + (Number(s.exam)||0);
                      const { grade, remark } = getGrade(total);

                      return (
                        <tr key={subject.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-medium text-[#0A1F44]">{subject.name}</td>
                          <td className="px-2 py-2 border-l">
                            <input type="number" min="0" max="10" value={s.firstCA} onChange={e => handleScoreChange(student.id, subject.id, 'firstCA', e.target.value)} className="w-12 border border-slate-300 rounded px-1 py-1 text-center focus:outline-none focus:border-[#0A1F44]" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="number" min="0" max="10" value={s.secondCA} onChange={e => handleScoreChange(student.id, subject.id, 'secondCA', e.target.value)} className="w-12 border border-slate-300 rounded px-1 py-1 text-center focus:outline-none focus:border-[#0A1F44]" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="number" min="0" max="10" value={s.thirdCA} onChange={e => handleScoreChange(student.id, subject.id, 'thirdCA', e.target.value)} className="w-12 border border-slate-300 rounded px-1 py-1 text-center focus:outline-none focus:border-[#0A1F44]" />
                          </td>
                          <td className="px-2 py-2">
                            <input type="number" min="0" max="70" value={s.exam} onChange={e => handleScoreChange(student.id, subject.id, 'exam', e.target.value)} className="w-14 border border-slate-300 rounded px-1 py-1 text-center focus:outline-none focus:border-[#0A1F44]" />
                          </td>
                          
                          <td className="px-2 py-2 text-center font-bold bg-slate-100 border-l text-slate-700">{total || '-'}</td>
                          <td className={`px-2 py-2 text-center font-bold bg-slate-100 ${
                            grade === 'A1' || grade === 'B2' || grade === 'B3' ? 'text-green-600' :
                            grade.startsWith('C') ? 'text-blue-600' :
                            grade.startsWith('D') || grade.startsWith('E') ? 'text-orange-500' :
                            grade === 'F9' ? 'text-red-600' : 'text-slate-400'
                          }`}>{grade}</td>
                          <td className="px-2 py-2 text-center text-xs text-slate-500 bg-slate-100">{remark}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 border-t p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Class Teacher's Remark</label>
                  <select 
                    value={scores[student.id]?.teacherRemark || ''} 
                    onChange={(e) => handleRemarkChange(student.id, 'teacherRemark', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
                  >
                    <option value="">Select Remark...</option>
                    <option value="An excellent performance. Keep it up!">Excellent</option>
                    <option value="A very good result. You can do better.">Very Good</option>
                    <option value="A good result. Keep working hard.">Good</option>
                    <option value="Fair result. You need to improve.">Fair</option>
                    <option value="Poor result. More effort is required.">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Principal's Remark</label>
                  <select 
                    value={scores[student.id]?.principalRemark || ''} 
                    onChange={(e) => handleRemarkChange(student.id, 'principalRemark', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44]"
                  >
                    <option value="">Select Remark...</option>
                    <option value="Outstanding performance. Promoted to the next class.">Outstanding</option>
                    <option value="Very good result. Promoted.">Very Good</option>
                    <option value="Good result. Promoted.">Good</option>
                    <option value="Fair result. Promoted on trial.">Fair</option>
                    <option value="Poor result. Advised to repeat the class.">Poor</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {classId && students.length > 0 && (
        <div className="flex justify-end pt-4 sticky bottom-4">
          <button onClick={onSubmit} disabled={loading} className="flex items-center gap-2 bg-[#0A1F44] text-white px-6 py-3 rounded-md font-medium hover:bg-opacity-90 disabled:opacity-50 transition shadow-lg w-full md:w-auto justify-center">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {loading ? 'Saving All Results...' : 'Save All Scores as Draft'}
          </button>
        </div>
      )}
    </div>
  );
}