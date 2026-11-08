'use client';

import { useState } from 'react';
import { createClass } from '@/server/actions/classes';
import { useRouter } from 'next/navigation';

export default function ClassForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const res = await createClass(formData);
    
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
        <label className="text-sm font-medium">Class Name</label>
        <input name="name" required className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]" placeholder="e.g. JSS 1A" />
      </div>
      <div>
        <label className="text-sm font-medium">Level (Optional)</label>
        <input name="level" className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]" placeholder="e.g. Junior Secondary" />
      </div>
      
      <button type="submit" disabled={loading} className="w-full bg-[#0A1F44] text-white rounded py-2 font-medium hover:bg-opacity-90 disabled:opacity-50 transition">
        {loading ? 'Saving...' : 'Save Class'}
      </button>
    </form>
  );
}