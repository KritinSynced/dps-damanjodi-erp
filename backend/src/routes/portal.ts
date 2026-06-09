import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Apply auth middleware to all portal routes to secure them
router.use(authenticateToken);

// --- 1. STUDENT PORTAL DATA ---
router.get("/student", async (req: Request, res: Response) => {
  try {
    const studentId = req.query.studentId as string;

    if (!studentId) {
      return res.status(400).json({ success: false, error: "Missing Student ID" });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        parent: {
          include: {
            user: true,
          },
        },
        attendance: {
          orderBy: { date: "desc" },
        },
        grades: {
          orderBy: { createdAt: "desc" },
        },
        bookIssues: {
          include: {
            book: true,
          },
          orderBy: { issueDate: "desc" },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, error: "Student profile not found" });
    }

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [{ targetRole: "ALL" }, { targetRole: "STUDENT" }],
      },
      orderBy: { date: "desc" },
      take: 8,
    });

    return res.json({ success: true, student, announcements });
  } catch (error: any) {
    console.error("Student Portal Backend Error:", error);
    return res.status(500).json({ success: false, error: "Server error retrieving student dashboard data" });
  }
});

// --- 2. PARENT PORTAL DATA ---
router.get("/parent", async (req: Request, res: Response) => {
  try {
    const parentId = req.query.parentId as string;

    if (!parentId) {
      return res.status(400).json({ success: false, error: "Missing Parent ID" });
    }

    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
      include: {
        user: true,
        students: {
          include: {
            user: true,
            attendance: {
              orderBy: { date: "desc" },
            },
            grades: {
              orderBy: { createdAt: "desc" },
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
      return res.status(404).json({ success: false, error: "Parent profile not found" });
    }

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [{ targetRole: "ALL" }, { targetRole: "PARENT" }],
      },
      orderBy: { date: "desc" },
      take: 8,
    });

    return res.json({ success: true, parent, announcements });
  } catch (error: any) {
    console.error("Parent Portal Backend Error:", error);
    return res.status(500).json({ success: false, error: "Server error retrieving parent dashboard data" });
  }
});

// --- 3. TEACHER PORTAL DATA ---
router.get("/teacher", async (req: Request, res: Response) => {
  try {
    const teacherId = req.query.teacherId as string;

    if (!teacherId) {
      return res.status(400).json({ success: false, error: "Missing Teacher ID" });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({ success: false, error: "Teacher profile not found" });
    }

    let students: any[] = [];
    let pendingLeaves: any[] = [];

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

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [{ targetRole: "ALL" }, { targetRole: "TEACHER" }],
      },
      orderBy: { date: "desc" },
      take: 6,
    });

    return res.json({ success: true, teacher, students, pendingLeaves, announcements });
  } catch (error: any) {
    console.error("Teacher Portal Backend Error:", error);
    return res.status(500).json({ success: false, error: "Server error retrieving teacher dashboard data" });
  }
});

// --- 4. ADMIN PORTAL DATA ---
router.get("/admin", async (req: Request, res: Response) => {
  try {
    const studentCount = await prisma.student.count();
    const teacherCount = await prisma.teacher.count();
    const bookCount = await prisma.book.count();

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


    const auditLogs = [
      { id: 1, action: "Admin session initialized", user: "Dr. Sujata Mohapatra", time: "Just now" },
      { id: 2, action: "Prisma client db connection sync", user: "System Engine", time: "5 mins ago" },
      { id: 3, action: "New leave request filed", user: "Rahul Mohanty (Student)", time: "10 mins ago" },
      { id: 4, action: "Weekly homework sheet published", user: "Sunita Sharma (Teacher)", time: "1 hour ago" },
      { id: 5, action: "Fee payment receipts verified", user: "Ramesh Mohanty (Parent)", time: "2 hours ago" },
    ];

    return res.json({
      success: true,
      metrics: { studentCount, teacherCount, bookCount },
      students,
      teachers,
      books,
      auditLogs,
    });
  } catch (error: any) {
    console.error("Admin Portal Backend Error:", error);
    return res.status(500).json({ success: false, error: "Server error retrieving admin dashboard logs" });
  }
});

// --- 5. LEAVES ROUTING ---
// POST: Submit leave request
router.post("/leaves", async (req: Request, res: Response) => {
  try {
    const { userId, role, startDate, endDate, reason } = req.body;

    if (!userId || !role || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, error: "Please enter all required fields" });
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

    return res.json({ success: true, leaveRequest: newLeave });
  } catch (error: any) {
    console.error("Leave Request Backend Error:", error);
    return res.status(500).json({ success: false, error: "Server error filing leave request" });
  }
});

// GET: Fetch leave requests for a user
router.get("/leaves", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ success: false, error: "Missing User ID" });
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { appliedDate: "desc" },
    });

    return res.json({ success: true, leaves });
  } catch (error: any) {
    console.error("Get Leaves Backend Error:", error);
    return res.status(500).json({ success: false, error: "Server error fetching leave records" });
  }
});

// POST: Update leave status (Approve/Reject)
router.post("/leaves/update", async (req: Request, res: Response) => {
  try {
    const { leaveId, status, comments } = req.body;

    if (!leaveId || !status) {
      return res.status(400).json({ success: false, error: "Missing Leave Request ID or Status" });
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status,
        comments: comments || null,
      },
    });

    return res.json({ success: true, leaveRequest: updatedLeave });
  } catch (error: any) {
    console.error("Update Leave Backend Error:", error);
    return res.status(500).json({ success: false, error: "Server error processing leave decision" });
  }
});


// --- 7. TEACHER OPERATIONS ---
// POST: Submit Student Attendance
router.post("/teacher/attendance", async (req: Request, res: Response) => {
  try {
    const { date, records, teacherId } = req.body;

    if (!date || !records || !Array.isArray(records) || !teacherId) {
      return res.status(400).json({ success: false, error: "Missing required attendance parameters" });
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    for (const rec of records) {
      await prisma.attendance.upsert({
        where: {
          studentId_date_subject: {
            studentId: rec.studentId,
            date: parsedDate,
            subject: rec.subject || "",
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

    return res.json({
      success: true,
      message: `Successfully marked attendance for ${records.length} students.`,
    });
  } catch (error: any) {
    console.error("Save Attendance Backend Error:", error);
    return res.status(500).json({ success: false, error: "Server error saving class attendance" });
  }
});

// POST: Submit Student Grade
router.post("/teacher/grades", async (req: Request, res: Response) => {
  try {
    const { studentId, subject, examType, theoryMarks, practicalMarks, maxMarks, term, academicYear } = req.body;

    if (!studentId || !subject || !examType || theoryMarks === undefined || !maxMarks) {
      return res.status(400).json({ success: false, error: "Missing required grade card parameters" });
    }

    const calculateGradeString = (percentage: number) => {
      if (percentage >= 91) return "A1";
      if (percentage >= 81) return "A2";
      if (percentage >= 71) return "B1";
      if (percentage >= 61) return "B2";
      if (percentage >= 51) return "C1";
      if (percentage >= 41) return "C2";
      return "D";
    };

    const tMarks = Number(theoryMarks);
    const pMarks = Number(practicalMarks || 0);
    const total = tMarks + pMarks;
    const max = Number(maxMarks);
    const percentage = (total / max) * 100;

    const newGrade = await prisma.grade.create({
      data: {
        studentId,
        subject,
        examType,
        theoryMarks: tMarks,
        practicalMarks: pMarks,
        totalMarks: total,
        maxMarks: max,
        grade: calculateGradeString(percentage),
        term: term || "Term 1",
        academicYear: academicYear || "2025-2026",
      },
    });

    return res.json({ success: true, gradeCard: newGrade });
  } catch (error: any) {
    console.error("Save Grade Backend Error:", error);
    return res.status(500).json({ success: false, error: "Server error uploading grade records" });
  }
});

// --- 8. ADMIN OPERATIONS ---
// POST: Create Announcement
router.post("/admin/announcements", async (req: Request, res: Response) => {
  try {
    const { title, content, targetRole, category, authorId } = req.body;

    if (!title || !content || !targetRole || !category || !authorId) {
      return res.status(400).json({ success: false, error: "Please enter all required announcement fields" });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: { title, content, targetRole, category, authorId },
    });

    return res.json({ success: true, announcement: newAnnouncement });
  } catch (error: any) {
    console.error("Admin Create Announcement Backend Error:", error);
    return res.status(500).json({ success: false, error: "Server error publishing announcement notice" });
  }
});

// POST: Create Student
router.post("/admin/students", async (req: Request, res: Response) => {
  try {
    const { name, email, className, section, rollNo, parentName, parentEmail, phone, address } = req.body;

    if (!name || !email || !className || !section || !rollNo || !parentName || !parentEmail || !phone) {
      return res.status(400).json({ success: false, error: "Please enter all required student and parent fields" });
    }

    const admissionNo = "DPS-2026-" + Math.floor(1000 + Math.random() * 9000);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Parent User
      const pUser = await tx.user.create({
        data: {
          email: parentEmail,
          passwordHash: "parent123",
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
          passwordHash: "student123",
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

    return res.json({ success: true, student: result });
  } catch (error: any) {
    console.error("Admin Student Create Backend Error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, error: "Email or Admission Number already registered" });
    }
    return res.status(500).json({ success: false, error: "Server error registering student profile" });
  }
});

// POST: Create Teacher
router.post("/admin/teachers", async (req: Request, res: Response) => {
  try {
    const { name, email, employeeId, department, qualification, phone, classTeacherOfClass, classTeacherOfSection } = req.body;

    if (!name || !email || !employeeId || !department || !qualification || !phone) {
      return res.status(400).json({ success: false, error: "Please enter all required teacher fields" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: "teacher123",
          role: "TEACHER",
          name,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
        },
      });

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

    return res.json({ success: true, teacher: result });
  } catch (error: any) {
    console.error("Admin Teacher Create Backend Error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, error: "Employee ID or Email already registered" });
    }
    return res.status(500).json({ success: false, error: "Server error registering teacher profile" });
  }
});

export default router;
