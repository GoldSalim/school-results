'use client';

import { useState, useEffect } from 'react';
import { saveResultsDraft } from '@/server/actions/results';
import { useRouter } from 'next/navigation';

type Class = { id: string; name: string };
type Subject = { id: string; name: string };
type Term = { id: string; name: string; session: { name: string } };
type Student = { id: string; fullName: string; admissionNo: string };

export default function UploadForm({ classes, subjects, terms }: { classes: Class[], subjects: Subject[], terms: Term[] }) {
  const router = useRouter();
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [termId, setTermId] = useState('');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Record<string, { firstCA: string, secondCA: string, exam: string }>>({});
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  useEffect(() => {
    if (!classId) {
      setStudents([]);
      return;
    }
    fetch(`/api/admin/students?classId=${classId}`)
      .then(res => res.json())
      .then(data => {
        setStudents(data);
        const initialScores: any = {};
        data.forEach((s: Student) => {
          initialScores[s.id] = { firstCA: '', secondCA: '', exam: '' };
        });
        setScores(initialScores);
      });
  }, [classId]);

  function handleScoreChange(studentId: string, field: 'firstCA' | 'secondCA' | 'exam', value: string) {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  }

  async function onSubmit() {
    if (!classId || !subjectId || !termId) {
      setMessage({ type: 'error', text: 'Please select Class, Subject, and Term.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formattedScores = Object.entries(scores).map(([studentId, s]) => ({
      studentId,
      firstCA: Number(s.firstCA) || 0,
      secondCA: Number(s.secondCA) || 0,
      exam: Number(s.exam) || 0,
    }));

    const res = await saveResultsDraft({ classId, subjectId, termId, scores: formattedScores });

    if (res.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: 'Scores saved as draft successfully!' });
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Class</label>
          <select value={classId} onChange={e => setClassId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] appearance-auto">
            <option value="">Select...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select Subject</label>
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] appearance-auto">
            <option value="">Select...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Select Term</label>
          <select value={termId} onChange={e => setTermId(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F44] appearance-auto">
            <option value="">Select...</option>
            {terms.map(t => <option key={t.id} value={t.id}>{t.session.name} - {t.name}</option>)}
          </select>
        </div>
      </div>

      {classId && students.length === 0 && (
        <p className="text-sm text-slate-500 py-4 text-center">No students found in this class.</p>
      )}

      {classId && students.length > 0 && (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="px-4 py-3 font-medium w-1/3">Student Name</th>
                <th className="px-4 py-3 font-medium">1st CA (10)</th>
                <th className="px-4 py-3 font-medium">2nd CA (10)</th>
                <th className="px-4 py-3 font-medium">Exam (80)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map(student => (
                <tr key={student.id}>
                  <td className="px-4 py-2">
                    <div className="font-medium">{student.fullName}</div>
                    <div className="text-xs text-slate-500">{student.admissionNo}</div>
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" min="0" max="10" value={scores[student.id]?.firstCA || ''} onChange={e => handleScoreChange(student.id, 'firstCA', e.target.value)} className="w-20 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" min="0" max="10" value={scores[student.id]?.secondCA || ''} onChange={e => handleScoreChange(student.id, 'secondCA', e.target.value)} className="w-20 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" min="0" max="80" value={scores[student.id]?.exam || ''} onChange={e => handleScoreChange(student.id, 'exam', e.target.value)} className="w-20 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0A1F44]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-md text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      {classId && students.length > 0 && (
        <div className="flex justify-end pt-4">
          <button onClick={onSubmit} disabled={loading} className="bg-[#0A1F44] text-white px-6 py-2 rounded-md font-medium hover:bg-opacity-90 disabled:opacity-50 transition shadow-sm">
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      )}
    </div>
  );
}