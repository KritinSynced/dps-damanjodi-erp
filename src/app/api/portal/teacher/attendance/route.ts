import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { date, records, teacherId } = await req.json();

    if (!date || !records || !Array.isArray(records) || !teacherId) {
      return NextResponse.json(
        { success: false, error: "Missing required attendance parameters" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    // Save attendance in database using transaction/loop
    for (const rec of records) {
      // Upsert record (create if not exist, update if exists)
      await prisma.attendance.upsert({
        where: {
          studentId_date_subject: {
            studentId: rec.studentId,
            date: parsedDate,
            subject: rec.subject || "", // default to empty string for daily attendance
          },
        },
        update: {
          status: rec.status,
          markedById: teacherId,
        },
        create: {
          studentId: rec.studentId,
          date: parsedDate,
          status: rec.status,
          subject: rec.subject || "",
          markedById: teacherId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully marked attendance for ${records.length} students.`,
    });
  } catch (error: any) {
    console.error("Save Attendance API Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error saving class attendance" },
      { status: 500 }
    );
  }
}
