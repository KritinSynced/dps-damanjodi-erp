import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: "Missing Teacher ID" },
        { status: 400 }
      );
    }

    // Query teacher details
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: true,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    let students: any[] = [];
    let pendingLeaves: any[] = [];

    // If teacher is assigned a class, fetch students in that class
    if (teacher.classTeacherOfClass && teacher.classTeacherOfSection) {
      students = await prisma.student.findMany({
        where: {
          class: teacher.classTeacherOfClass,
          section: teacher.classTeacherOfSection,
        },
        include: {
          user: true,
        },
        orderBy: { rollNo: "asc" },
      });

      // Get user IDs for those students to fetch leave requests
      const studentUserIds = students.map((s) => s.userId);
      pendingLeaves = await prisma.leaveRequest.findMany({
        where: {
          userId: { in: studentUserIds },
          status: "PENDING",
        },
        include: {
          user: true,
        },
        orderBy: { appliedDate: "desc" },
      });
    }

    // Fetch school announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [{ targetRole: "ALL" }, { targetRole: "TEACHER" }],
      },
      orderBy: { date: "desc" },
      take: 6,
    });

    return NextResponse.json({
      success: true,
      teacher,
      students,
      pendingLeaves,
      announcements,
    });
  } catch (error: any) {
    console.error("Teacher Portal API Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error retrieving teacher dashboard data" },
      { status: 500 }
    );
  }
}
