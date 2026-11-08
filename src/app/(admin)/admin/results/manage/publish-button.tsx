'use client';

import { useState } from 'react';
import { publishResults } from '@/server/actions/results';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function PublishButton({ resultId }: { resultId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    if (!confirm('Are you sure you want to publish this result? Students will be able to see it immediately.')) return;
    
    setLoading(true);
    const res = await publishResults([resultId]);
    setLoading(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handlePublish}
      disabled={loading}
      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition disabled:opacity-50"
    >
      <CheckCircle className="h-4 w-4" />
      {loading ? 'Publishing...' : 'Publish'}
    </button>
  );
}