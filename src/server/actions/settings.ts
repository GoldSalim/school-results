'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

const schoolSettingsSchema = z.object({
  name: z.string().min(2, 'School name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

export async function updateSchoolSettings(formData: FormData) {
  const { schoolId } = await requireAdmin();
  
  const parsed = schoolSettingsSchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address'),
    phone: formData.get('phone'),
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await db.school.update({
      where: { id: schoolId },
      data: parsed.data,
    });
    
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update settings.' };
  }
}