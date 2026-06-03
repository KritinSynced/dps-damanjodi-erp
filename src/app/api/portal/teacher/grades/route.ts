import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const calculateGradeString = (percentage: number) => {
  if (percentage >= 91) return "A1";
  if (percentage >= 81) return "A2";
  if (percentage >= 71) return "B1";
  if (percentage >= 61) return "B2";
  if (percentage >= 51) return "C1";
  if (percentage >= 41) return "C2";
  return "D";
};

export async function POST(req: NextRequest) {
  try {
    const { studentId, subject, examType, theoryMarks, practicalMarks, maxMarks, term, academicYear } = await req.json();

    if (!studentId || !subject || !examType || theoryMarks === undefined || !maxMarks) {
      return NextResponse.json(
        { success: false, error: "Missing required grade card parameters" },
        { status: 400 }
      );
    }

    const tMarks = Number(theoryMarks);
    const pMarks = Number(practicalMarks || 0);
    const total = tMarks + pMarks;
    const max = Number(maxMarks);
    const percentage = (total / max) * 100;

    const newGrade = await prisma.grade.create({
      data: {
        studentId,
        subject,
        examType,
        theoryMarks: tMarks,
        practicalMarks: pMarks,
        totalMarks: total,
        maxMarks: max,
        grade: calculateGradeString(percentage),
        term: term || "Term 1",
        academicYear: academicYear || "2025-2026",
      },
    });

    return NextResponse.json({
      success: true,
      gradeCard: newGrade,
    });
  } catch (error: any) {
    console.error("Save Grade API Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error uploading grade records" },
      { status: 500 }
    );
  }
}
