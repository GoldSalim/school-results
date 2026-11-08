'use client';

import { useState } from 'react';
import { updateSchoolSettings } from '@/server/actions/settings';
import { useRouter } from 'next/navigation';
import { School } from '@prisma/client';

export default function SettingsForm({ school }: { school: School }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const formData = new FormData(e.currentTarget);
    const res = await updateSchoolSettings(formData);
    
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess('School settings updated successfully!');
      router.refresh();
      setTimeout(() => setSuccess(null), 3000);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
      {success && <div className="text-sm text-green-700 bg-green-50 p-2 rounded">{success}</div>}
      
      <div>
        <label className="text-sm font-medium">School Name</label>
        <input 
          name="name" 
          defaultValue={school.name} 
          required 
          className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]" 
        />
      </div>

      <div>
        <label className="text-sm font-medium">Address</label>
        <input 
          name="address" 
          defaultValue={school.address || ''} 
          className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Phone Number</label>
          <input 
            name="phone" 
            defaultValue={school.phone || ''} 
            className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]" 
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email Address</label>
          <input 
            name="email" 
            type="email"
            defaultValue={school.email || ''} 
            className="w-full border rounded px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-[#0A1F44]" 
          />
        </div>
      </div>
      
      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-[#0A1F44] text-white rounded px-6 py-2 font-medium hover:bg-opacity-90 disabled:opacity-50 transition"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}