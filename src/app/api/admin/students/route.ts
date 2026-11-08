import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: Request) {
  try {
    const { schoolId } = await requireAdmin();
    const url = new URL(req.url);
    const classId = url.searchParams.get('classId');

    if (!classId) return NextResponse.json([]);

    const students = await db.student.findMany({
      where: { 
        schoolId, 
        classId 
      },
      orderBy: { fullName: 'asc' },
    });
    
    return NextResponse.json(students);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
}