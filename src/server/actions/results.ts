'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

const scoreSchema = z.object({
  subjectId: z.string(),
  firstCA: z.coerce.number().min(0).max(10),
  secondCA: z.coerce.number().min(0).max(10),
  thirdCA: z.coerce.number().min(0).max(10),
  exam: z.coerce.number().min(0).max(70),
});

const studentResultSchema = z.object({
  studentId: z.string(),
  teacherRemark: z.string().optional(),
  principalRemark: z.string().optional(),
  scores: z.array(scoreSchema),
});

const uploadResultsSchema = z.object({
  classId: z.string(),
  termId: z.string(),
  studentsData: z.array(studentResultSchema),
});

export async function saveBulkResults(input: any) {
  const { userId, schoolId } = await requireAdmin();
  const parsed = uploadResultsSchema.safeParse(input);
  
  if (!parsed.success) {
    return { error: 'Invalid data submitted. Please check the scores.' };
  }

  const { classId, termId, studentsData } = parsed.data;

  try {
    await db.$transaction(async (tx) => {
      for (const student of studentsData) {
        const result = await tx.result.upsert({
          where: { studentId_termId: { studentId: student.studentId, termId } },
          create: {
            studentId: student.studentId,
            classId,
            termId,
            schoolId,
            createdById: userId,
            status: 'DRAFT',
            teacherRemark: student.teacherRemark,
            principalRemark: student.principalRemark,
          },
          update: {
            teacherRemark: student.teacherRemark,
            principalRemark: student.principalRemark,
          },
        });

        let totalOverallScore = 0;
        let validScoresCount = 0;

        for (const score of student.scores) {
          if (score.firstCA === 0 && score.secondCA === 0 && score.thirdCA === 0 && score.exam === 0) continue;

          const total = score.firstCA + score.secondCA + score.thirdCA + score.exam;
          totalOverallScore += total;
          validScoresCount++;
          
          let grade = 'F9';
          if (total >= 75) grade = 'A1';
          else if (total >= 70) grade = 'B2';
          else if (total >= 65) grade = 'B3';
          else if (total >= 60) grade = 'C4';
          else if (total >= 55) grade = 'C5';
          else if (total >= 50) grade = 'C6';
          else if (total >= 45) grade = 'D7';
          else if (total >= 40) grade = 'E8';

          await tx.resultSubjectScore.upsert({
            where: { resultId_subjectId: { resultId: result.id, subjectId: score.subjectId } },
            create: {
              resultId: result.id,
              subjectId: score.subjectId,
              firstCA: score.firstCA,
              secondCA: score.secondCA,
              thirdCA: score.thirdCA,
              exam: score.exam,
              total,
              grade,
            },
            update: {
              firstCA: score.firstCA,
              secondCA: score.secondCA,
              thirdCA: score.thirdCA,
              exam: score.exam,
              total,
              grade,
            },
          });
        }

        const average = validScoresCount > 0 ? totalOverallScore / validScoresCount : 0;
        await tx.result.update({
          where: { id: result.id },
          data: { totalScore: totalOverallScore, average },
        });
      }
    });

    revalidatePath('/admin/results/manage');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to save results. Please try again.' };
  }
}

export async function publishResults(resultIds: string[]) {
  const { userId, schoolId } = await requireAdmin();
  try {
    await db.result.updateMany({
      where: { id: { in: resultIds }, schoolId },
      data: { status: 'PUBLISHED', publishedById: userId, publishedAt: new Date() },
    });
    revalidatePath('/admin/results/manage');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to publish results.' };
  }
}