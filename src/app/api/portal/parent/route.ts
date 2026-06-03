import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");

    if (!parentId) {
      return NextResponse.json(
        { success: false, error: "Missing Parent ID" },
        { status: 400 }
      );
    }

    // Fetch parent profile and all linked children
    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      include: {
        user: true,
        students: {
          include: {
            user: true,
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
            },
          },
        },
      },
    });

    if (!parent) {
      return NextResponse.json(
        { success: false, error: "Parent profile not found" },
        { status: 404 }
      );
    }

    // Fetch announcements that apply to parents
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [{ targetRole: "ALL" }, { targetRole: "PARENT" }],
      },
      orderBy: { date: "desc" },
      take: 8,
    });

    return NextResponse.json({
      success: true,
      parent,
      announcements,
    });
  } catch (error: any) {
    console.error("Parent Portal API Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error retrieving parent dashboard data" },
      { status: 500 }
    );
  }
}
