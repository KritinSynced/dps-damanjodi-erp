import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both email and password" },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.passwordHash !== password) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Initialize session data
    const sessionUser: any = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
    };

    // Load role-specific IDs and fields
    if (user.role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: user.id },
      });
      if (student) {
        sessionUser.studentId = student.id;
        sessionUser.class = student.class;
        sessionUser.section = student.section;
        sessionUser.parentId = student.parentId;
      }
    } else if (user.role === "TEACHER") {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
      });
      if (teacher) {
        sessionUser.teacherId = teacher.id;
      }
    } else if (user.role === "PARENT") {
      const parent = await prisma.parent.findUnique({
        where: { userId: user.id },
      });
      if (parent) {
        sessionUser.parentId = parent.id;
      }
    }

    return NextResponse.json({
      success: true,
      user: sessionUser,
    });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error during login" },
      { status: 500 }
    );
  }
}
