'use client';

import { useState } from 'react';
import { deleteClass } from '@/server/actions/classes';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import EditClassModal from './edit-class-modal';

type Class = { id: string; name: string; level: string | null };

export default function ClassActions({ cls }: { cls: Class }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete the class ${cls.name}? This action cannot be undone.`)) return;
    
    setIsDeleting(true);
    const res = await deleteClass(cls.id);
    setIsDeleting(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => setIsEditOpen(true)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
          <Edit className="h-4 w-4" />
        </button>
        <button onClick={handleDelete} disabled={isDeleting} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50" title="Delete">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {isEditOpen && (
        <EditClassModal 
          cls={cls} 
          onClose={() => setIsEditOpen(false)} 
        />
      )}
    </>
  );
}