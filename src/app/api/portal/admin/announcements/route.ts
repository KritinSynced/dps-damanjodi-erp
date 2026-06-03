import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { title, content, targetRole, category, authorId } = await req.json();

    if (!title || !content || !targetRole || !category || !authorId) {
      return NextResponse.json(
        { success: false, error: "Please enter all required announcement fields" },
        { status: 400 }
      );
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        targetRole,
        category,
        authorId,
      },
    });

    return NextResponse.json({
      success: true,
      announcement: newAnnouncement,
    });
  } catch (error: any) {
    console.error("Admin Create Announcement API Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error publishing announcement notice" },
      { status: 500 }
    );
  }
}
