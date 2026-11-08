'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(50),
  level: z.string().max(50).optional(),
});

export async function createClass(formData: FormData) {
  const { schoolId } = await requireAdmin();
  
  const parsed = createClassSchema.safeParse({
    name: formData.get('name'),
    level: formData.get('level'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await db.class.create({
      data: { ...parsed.data, schoolId },
    });
    revalidatePath('/admin/classes');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'A class with this name already exists.' };
    }
    return { error: 'Failed to create class.' };
  }
}

export async function updateClass(formData: FormData) {
  const { schoolId } = await requireAdmin();
  const classId = formData.get('classId') as string;

  const parsed = createClassSchema.safeParse({
    name: formData.get('name'),
    level: formData.get('level'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await db.class.update({
      where: { id: classId, schoolId },
      data: parsed.data,
    });
    revalidatePath('/admin/classes');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'A class with this name already exists.' };
    }
    return { error: 'Failed to update class.' };
  }
}

export async function deleteClass(classId: string) {
  const { schoolId } = await requireAdmin();

  try {
    await db.class.delete({
      where: { id: classId, schoolId },
    });
    revalidatePath('/admin/classes');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete class. Make sure there are no students assigned to it.' };
  }
}