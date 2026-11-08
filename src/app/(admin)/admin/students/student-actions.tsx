'use client';

import { useState } from 'react';
import { deleteStudent } from '@/server/actions/students';
import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import EditStudentModal from './edit-student-modal';

type Class = { id: string; name: string };
type Student = { id: string; fullName: string; admissionNo: string; classId: string };

export default function StudentActions({ student, classes }: { student: Student, classes: Class[] }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${student.fullName}? This action cannot be undone.`)) return;
    
    setIsDeleting(true);
    const res = await deleteStudent(student.id);
    setIsDeleting(false);
    
    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={() => setIsEditOpen(true)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
          <Edit className="h-4 w-4" />
        </button>
        <button onClick={handleDelete} disabled={isDeleting} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50" title="Delete">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {isEditOpen && (
        <EditStudentModal 
          student={student} 
          classes={classes} 
          onClose={() => setIsEditOpen(false)} 
        />
      )}
    </>
  );
}