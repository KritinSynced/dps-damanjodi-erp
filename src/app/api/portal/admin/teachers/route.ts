import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, employeeId, department, qualification, phone, classTeacherOfClass, classTeacherOfSection } = await req.json();

    if (!name || !email || !employeeId || !department || !qualification || !phone) {
      return NextResponse.json(
        { success: false, error: "Please enter all required teacher fields" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: "teacher123", // default password
          role: "TEACHER",
          name,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
        },
      });

      // 2. Create Teacher profile
      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId,
          department,
          qualification,
          phone,
          classTeacherOfClass: classTeacherOfClass || null,
          classTeacherOfSection: classTeacherOfSection || null,
        },
      });

      return teacher;
    });

    return NextResponse.json({
      success: true,
      teacher: result,
    });
  } catch (error: any) {
    console.error("Admin Teacher Create API Error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Employee ID or Email already registered" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Server error registering teacher profile" },
      { status: 500 }
    );
  }
}
