import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Fetch counts
    const studentCount = await prisma.student.count();
    const teacherCount = await prisma.teacher.count();
    const routeCount = await prisma.busRoute.count();
    const bookCount = await prisma.book.count();

    // Fetch lists
    const students = await prisma.student.findMany({
      include: {
        user: true,
        parent: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { class: "asc" },
    });

    const teachers = await prisma.teacher.findMany({
      include: {
        user: true,
      },
      orderBy: { employeeId: "asc" },
    });

    const books = await prisma.book.findMany({
      orderBy: { title: "asc" },
    });

    const routes = await prisma.busRoute.findMany({
      orderBy: { routeName: "asc" },
    });

    // Create a mock audit log feed
    const auditLogs = [
      { id: 1, action: "Admin session initialized", user: "Dr. Sujata Mohapatra", time: "Just now" },
      { id: 2, action: "Prisma client db connection sync", user: "System Engine", time: "5 mins ago" },
      { id: 3, action: "New leave request filed", user: "Rahul Mohanty (Student)", time: "10 mins ago" },
      { id: 4, action: "Weekly homework sheet published", user: "Sunita Sharma (Teacher)", time: "1 hour ago" },
      { id: 5, action: "Fee payment receipts verified", user: "Ramesh Mohanty (Parent)", time: "2 hours ago" },
    ];

    return NextResponse.json({
      success: true,
      metrics: {
        studentCount,
        teacherCount,
        routeCount,
        bookCount,
      },
      students,
      teachers,
      books,
      routes,
      auditLogs,
    });
  } catch (error: any) {
    console.error("Admin Portal API Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error retrieving admin dashboard logs" },
      { status: 500 }
    );
  }
}
