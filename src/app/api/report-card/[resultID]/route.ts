import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { db } from '@/lib/db';
import { requireStudent } from '@/lib/rbac';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
    const { resultId } = await params;
    const { student } = await requireStudent();

    const result = await db.result.findFirst({
      where: { id: resultId, studentId: student.id, status: 'PUBLISHED' },
      include: {
        student: { include: { school: true } },
        class: true,
        term: { include: { session: true } },
        scores: { include: { subject: true }, orderBy: { subject: { name: 'asc' } } },
      },
    });

    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    const finished = new Promise<Buffer>((resolve) =>
      doc.on('end', () => resolve(Buffer.concat(chunks)))
    );

    const school = result.student.school;
    const studentRec = result.student;

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text(school.name, { align: 'center' });
    doc.fontSize(10).font('Helvetica')
      .text(school.address || '', { align: 'center' })
      .text(`${school.phone || ''}  |  ${school.email || ''}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold')
      .text('TERMINAL REPORT CARD', { align: 'center' });
    doc.moveDown(1);

    // Student meta
    doc.fontSize(10).font('Helvetica');
    doc.text(`Student: ${studentRec.fullName}`, { continued: true })
       .text(`Admission No: ${studentRec.admissionNo}`, { align: 'right' });
    doc.text(`Class: ${result.class.name}`, { continued: true })
       .text(`Session: ${result.term.session.name} — ${result.term.name}`, { align: 'right' });
    doc.moveDown(1);

    // Scores table
    const tableTop = doc.y;
    const colX = [40, 220, 260, 300, 340, 390, 440];
    doc.font('Helvetica-Bold').fontSize(9);
    doc.text('Subject', colX[0], tableTop);
    doc.text('1st CA', colX[1], tableTop);
    doc.text('2nd CA', colX[2], tableTop);
    doc.text('3rd CA', colX[3], tableTop);
    doc.text('Exam', colX[4], tableTop);
    doc.text('Total', colX[5], tableTop);
    doc.text('Grade', colX[6], tableTop);

    let y = tableTop + 15;
    doc.font('Helvetica');
    for (const s of result.scores) {
      doc.text(s.subject.name, colX[0], y, { width: 170 });
      doc.text(String(s.firstCA), colX[1], y);
      doc.text(String(s.secondCA), colX[2], y);
      doc.text(String(s.thirdCA), colX[3], y);
      doc.text(String(s.exam), colX[4], y);
      doc.text(String(s.total), colX[5], y);
      doc.text(s.grade, colX[6], y);
      y += 18;
      if (y > 720) { doc.addPage(); y = 40; }
    }

    // Summary
    doc.moveTo(40, y + 6).lineTo(555, y + 6).stroke();
    y += 16;
    doc.font('Helvetica-Bold')
      .text(`Total Score: ${result.totalScore ?? '-'}`, 40, y, { continued: true })
      .text(`Average: ${result.average?.toFixed(2) ?? '-'}`, { align: 'right' });

    // Add Remarks to PDF
    y += 30;
    doc.font('Helvetica-Bold').fontSize(10).text("Class Teacher's Remark:", 40, y);
    y += 15;
    doc.font('Helvetica').fontSize(10).text(result.teacherRemark || 'None', 40, y, { width: 500 });
    
    y += 25;
    doc.font('Helvetica-Bold').fontSize(10).text("Principal's Remark:", 40, y);
    y += 15;
    doc.font('Helvetica').fontSize(10).text(result.principalRemark || 'None', 40, y, { width: 500 });

    doc.end();
    const buffer = await finished;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="report-card-${studentRec.admissionNo}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error("PDF Error:", error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}