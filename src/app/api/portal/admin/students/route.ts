import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, className, section, rollNo, parentName, parentEmail, phone, address } = await req.json();

    if (!name || !email || !className || !section || !rollNo || !parentName || !parentEmail || !phone) {
      return NextResponse.json(
        { success: false, error: "Please enter all required student and parent fields" },
        { status: 400 }
      );
    }

    // Generate unique codes
    const admissionNo = "DPS-2026-" + Math.floor(1000 + Math.random() * 9000);

    // Create records inside a database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Parent User
      const pUser = await tx.user.create({
        data: {
          email: parentEmail,
          passwordHash: "parent123", // default password
          role: "PARENT",
          name: parentName,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${parentName}`,
        },
      });

      // 2. Create Parent Profile
      const parentProfile = await tx.parent.create({
        data: {
          userId: pUser.id,
          phone,
          relation: "FATHER",
          address: address || "Nalco Township, Damanjodi",
        },
      });

      // 3. Create Student User
      const sUser = await tx.user.create({
        data: {
          email,
          passwordHash: "student123", // default password
          role: "STUDENT",
          name,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
        },
      });

      // 4. Create Student Profile
      const studentProfile = await tx.student.create({
        data: {
          userId: sUser.id,
          admissionNo,
          class: className,
          section,
          rollNo: Number(rollNo),
          dateOfBirth: new Date("2012-05-15"),
          gender: "Male",
          phone,
          address: address || "Nalco Township, Damanjodi",
          parentId: parentProfile.id,
        },
      });

      return studentProfile;
    });

    return NextResponse.json({
      success: true,
      student: result,
    });
  } catch (error: any) {
    console.error("Admin Student Create API Error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Email or Admission Number already registered" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Server error registering student profile" },
      { status: 500 }
    );
  }
}
