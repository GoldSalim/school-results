'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';

const createStudentSchema = z.object({
  fullName: z.string().min(2, 'Name is too short').max(120),
  admissionNo: z.string().min(1, 'Admission number is required').max(40),
  classId: z.string().min(1, 'Please select a class'),
});

export async function createStudent(formData: FormData) {
  const { schoolId } = await requireAdmin();
  
  const rawData = {
    fullName: formData.get('fullName'),
    admissionNo: formData.get('admissionNo'),
    classId: formData.get('classId'),
  };

  const parsed = createStudentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await db.student.create({
      data: {
        ...parsed.data,
        admissionNo: parsed.data.admissionNo.toUpperCase(),
        schoolId,
      },
    });
    
    revalidatePath('/admin/students');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'A student with this admission number already exists.' };
    }
    return { error: 'Failed to create student. Please try again.' };
  }
}

export async function updateStudent(formData: FormData) {
  const { schoolId } = await requireAdmin();
  
  const studentId = formData.get('studentId') as string;
  const rawData = {
    fullName: formData.get('fullName'),
    admissionNo: formData.get('admissionNo'),
    classId: formData.get('classId'),
  };

  const parsed = createStudentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await db.student.update({
      where: { id: studentId, schoolId },
      data: {
        ...parsed.data,
        admissionNo: parsed.data.admissionNo.toUpperCase(),
      },
    });
    revalidatePath('/admin/students');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'Admission number already exists.' };
    }
    return { error: 'Failed to update student.' };
  }
}

export async function deleteStudent(studentId: string) {
  const { schoolId } = await requireAdmin();

  try {
    await db.student.delete({
      where: { id: studentId, schoolId },
    });
    revalidatePath('/admin/students');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete student. They may have linked results or accounts.' };
  }
}

// ==========================================
// NEW: STUDENT SELF-ACTIVATION (WITH RETRY)
// ==========================================

export async function setupStudentPassword(formData: FormData) {
  const admissionNo = formData.get('admissionNo') as string;
  const password = formData.get('password') as string;

  if (!admissionNo || !password) return { error: 'Missing fields' };
  if (password.length < 6) return { error: 'Password must be at least 6 characters long.' };

  const attemptRegistration = async (retries = 3): Promise<{ success?: boolean, error?: string }> => {
    try {
      // Search case-insensitively and trim spaces
      const student = await db.student.findFirst({
        where: { 
          admissionNo: {
            equals: admissionNo.trim(),
            mode: 'insensitive'
          }
        },
      });

      if (!student) return { error: 'Admission number not found. Please contact your school admin.' };
      if (student.userId) return { error: 'This admission number already has a password set. Please log in.' };

      const passwordHash = await hash(password, 12);

      await db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            // GENERATE A FAKE INTERNAL EMAIL SO THE DATABASE ACCEPTS IT
            email: `${student.admissionNo.toLowerCase()}@student.local`, 
            name: student.fullName,
            passwordHash,
            role: 'STUDENT',
            schoolId: student.schoolId,
          },
        });

        await tx.student.update({
          where: { id: student.id },
          data: { userId: user.id, isVerified: true },
        });
      });

      return { success: true };
    } catch (error: any) {
      if (retries > 0 && (error.code === 'P1001' || error.message.includes("Can't reach database server") || error.message.includes("Timed out"))) {
        console.log(`Database asleep. Retrying in 2 seconds... (${retries} retries left)`);
        await new Promise(res => setTimeout(res, 2000));
        return attemptRegistration(retries - 1);
      }
      
      console.error("Registration Error:", error);
      return { error: `Registration failed: ${error.message || 'Unknown error'}` };
    }
  };

  return attemptRegistration();
}