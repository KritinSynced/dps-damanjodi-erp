import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, role, startDate, endDate, reason } = await req.json();

    if (!userId || !role || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { success: false, error: "Please enter all required fields" },
        { status: 400 }
      );
    }

    const newLeave = await prisma.leaveRequest.create({
      data: {
        userId,
        role,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      leaveRequest: newLeave,
    });
  } catch (error: any) {
    console.error("Leave Request API Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error filing leave request" },
      { status: 500 }
    );
  }
}
