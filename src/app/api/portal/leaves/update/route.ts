import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { leaveId, status, comments } = await req.json();

    if (!leaveId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing Leave Request ID or Status" },
        { status: 400 }
      );
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status,
        comments: comments || null,
      },
    });

    return NextResponse.json({
      success: true,
      leaveRequest: updatedLeave,
    });
  } catch (error: any) {
    console.error("Update Leave API Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error processing leave decision" },
      { status: 500 }
    );
  }
}
