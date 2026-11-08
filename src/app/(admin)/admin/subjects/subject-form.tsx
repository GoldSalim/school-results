'use client';

import { useState } from 'react';
import { createSubject } from '@/server/actions/subjects';
import { useRouter } from 'next/navigation';

export default function SubjectForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const res = await createSubject(formData);
    
    if (res.error) {
      setError(res.error);
    } else {
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
      
      <div>
        <label className="text-sm font-medium">Subject Name</label>
        <input name="name" required className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]" placeholder="e.g. Mathematics" />
      </div>
      <div>
        <label className="text-sm font-medium">Subject Code (Optional)</label>
        <input name="code" className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]" placeholder="e.g. MTH" />
      </div>
      
      <button type="submit" disabled={loading} className="w-full bg-[#0A1F44] text-white rounded py-2 font-medium hover:bg-opacity-90 disabled:opacity-50 transition">
        {loading ? 'Saving...' : 'Save Subject'}
      </button>
    </form>
  );
}