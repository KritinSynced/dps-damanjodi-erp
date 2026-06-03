import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Missing Student ID" },
        { status: 400 }
      );
    }

    // Query student along with related profile objects
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        parent: {
          include: {
            user: true,
          },
        },
        transportRoute: true,
        attendance: {
          orderBy: { date: "desc" },
        },
        grades: {
          orderBy: { createdAt: "desc" },
        },
        feePayments: {
          orderBy: { dueDate: "asc" },
        },
        bookIssues: {
          include: {
            book: true,
          },
          orderBy: { issueDate: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Fetch announcements that apply to students
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [{ targetRole: "ALL" }, { targetRole: "STUDENT" }],
      },
      orderBy: { date: "desc" },
      take: 8,
    });

    return NextResponse.json({
      success: true,
      student,
      announcements,
    });
  } catch (error: any) {
    console.error("Student Portal API Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error retrieving student dashboard data" },
      { status: 500 }
    );
  }
}
