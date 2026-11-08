'use client';

import { useState } from 'react';
import { updateStudent } from '@/server/actions/students';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

type Class = { id: string; name: string };
type Student = { id: string; fullName: string; admissionNo: string; classId: string };

export default function EditStudentModal({ 
  student, 
  classes, 
  onClose 
}: { 
  student: Student, 
  classes: Class[], 
  onClose: () => void 
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    formData.append('studentId', student.id);
    
    const res = await updateStudent(formData);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.refresh();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-[#0A1F44]">Edit Student</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="p-4 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
          
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input name="fullName" defaultValue={student.fullName} required className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]" />
          </div>
          <div>
            <label className="text-sm font-medium">Admission No.</label>
            <input name="admissionNo" defaultValue={student.admissionNo} required className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]" />
          </div>
          <div>
            <label className="text-sm font-medium">Class</label>
            <select name="classId" defaultValue={student.classId} required className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44] bg-white">
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#0A1F44] text-white rounded text-sm font-medium hover:bg-opacity-90 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}