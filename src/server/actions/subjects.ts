'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(50),
  code: z.string().max(20).optional(),
});

export async function createSubject(formData: FormData) {
  const { schoolId } = await requireAdmin();
  
  const parsed = createSubjectSchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await db.subject.create({
      data: { 
        name: parsed.data.name,
        code: parsed.data.code || null,
        schoolId 
      },
    });
    revalidatePath('/admin/subjects');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'A subject with this name already exists.' };
    }
    return { error: 'Failed to create subject.' };
  }
}