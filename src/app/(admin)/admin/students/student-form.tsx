'use client';

import { useState } from 'react';
import { createStudent } from '@/server/actions/students';
import { useRouter } from 'next/navigation';

export default function StudentForm({ classes }: { classes: { id: string, name: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const res = await createStudent(formData);
    
    if (res.error) {
      setError(res.error);
    } else {
      // Reset form and refresh the page to show the new student
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
      
      <div>
        <label className="text-sm font-medium">Full Name</label>
        <input name="fullName" required className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]" placeholder="John Doe" />
      </div>
      <div>
        <label className="text-sm font-medium">Admission No.</label>
        <input name="admissionNo" required className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]" placeholder="SCH/2024/001" />
      </div>
      <div>
        <label className="text-sm font-medium">Class</label>
        <select name="classId" required className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44] bg-white">
          <option value="">Select a class...</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      
      <button type="submit" disabled={loading} className="w-full bg-[#0A1F44] text-white rounded py-2 font-medium hover:bg-opacity-90 disabled:opacity-50 transition">
        {loading ? 'Saving...' : 'Save Student'}
      </button>
    </form>
  );
}