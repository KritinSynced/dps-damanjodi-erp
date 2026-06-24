import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import bcrypt from "bcryptjs";

const router = Router();

// Apply auth middleware to secure all portal / admin routes
router.use(authenticateToken);

// --- HELPER: LOG AUDIT ACTION ---
async function logAudit(actorId: string, action: string, target?: string, metadata?: any) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        target,
        metadata: metadata || {}
      }
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

// --- HELPER: PASSWORD GENERATION FOR USER ---
function generateUserPassword(email: string, dobDate: Date): string {
  const username = email.trim().toLowerCase().split('@')[0];
  const day = String(dobDate.getDate()).padStart(2, '0');
  const month = String(dobDate.getMonth() + 1).padStart(2, '0');
  const year = dobDate.getFullYear();
  return `${username}@${day}${month}${year}`;
}

// ==========================================
// 1. ROLE DASHBOARDS
// ==========================================

// --- STUDENT PORTAL DATA ---
router.get("/student", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return res.status(400).json({ success: false, error: "Missing user ID in session" });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        attendance: { orderBy: { date: "desc" } },
        grades: { orderBy: { createdAt: "desc" } },
        bookIssues: {
          include: { book: true },
          orderBy: { issueDate: "desc" }
        }
      }
    });

    if (!studentProfile) {
      return res.status(404).json({ success: false, error: "Student profile not found" });
    }

    // Map rollNumber to rollNo for UI compatibility
    const student = {
      ...studentProfile,
      rollNo: studentProfile.rollNumber,
      bloodGroup: "N/A", // Not stored in DB yet — placeholder
      // Map profileImage -> avatar for frontend compatibility
      user: {
        ...studentProfile.user,
        avatar: studentProfile.user.profileImage ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentProfile.user.name)}`
      },
      // Fallback parent format
      parent: {
        user: { name: studentProfile.parentName },
        phone: studentProfile.parentPhone,
        address: studentProfile.user.address
      }
    };

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      },
      orderBy: { date: "desc" },
      take: 8
    });

    return res.json({ success: true, student, announcements });
  } catch (error: any) {
    console.error("Student Portal API Error:", error);
    return res.status(500).json({ success: false, error: "Failed to retrieve student portal data" });
  }
});

// --- TEACHER PORTAL DATA ---
router.get("/teacher", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return res.status(400).json({ success: false, error: "Missing user ID in session" });
    }

    const teacher = await prisma.teacherProfile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!teacher) {
      return res.status(404).json({ success: false, error: "Teacher profile not found" });
    }

    // Fetch class students
    const students = await prisma.studentProfile.findMany({
      where: {
        class: "10", // Default to class 10 for standard teacher in seed, or dynamically fetch
        section: "A"
      },
      include: { user: true },
      orderBy: { rollNumber: "asc" }
    });

    // Map fields for client UI compatibility
    const mappedStudents = students.map(s => ({
      ...s,
      rollNo: s.rollNumber
    }));

    const studentUserIds = students.map((s) => s.userId);
    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: {
        userId: { in: studentUserIds },
        status: "PENDING"
      },
      include: { user: true },
      orderBy: { appliedDate: "desc" }
    });

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      },
      orderBy: { date: "desc" },
      take: 8
    });

    return res.json({
      success: true,
      teacher,
      students: mappedStudents,
      pendingLeaves,
      announcements
    });
  } catch (error: any) {
    console.error("Teacher Portal API Error:", error);
    return res.status(500).json({ success: false, error: "Failed to retrieve teacher portal data" });
  }
});

// --- PRINCIPAL PORTAL DATA ---
router.get("/principal", async (req: Request, res: Response) => {
  try {
    const studentCount = await prisma.studentProfile.count();
    const teacherCount = await prisma.teacherProfile.count();
    const announcementsCount = await prisma.announcement.count();

    const teachers = await prisma.teacherProfile.findMany({
      include: { user: true },
      orderBy: { employeeId: "asc" }
    });

    const students = await prisma.studentProfile.findMany({
      include: { user: true },
      orderBy: { class: "asc" }
    });

    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { appliedDate: "desc" }
    });

    return res.json({
      success: true,
      metrics: {
        studentCount,
        teacherCount,
        announcementsCount
      },
      teachers,
      students: students.map(s => ({
        ...s,
        rollNo: s.rollNumber,
        parent: {
          user: { name: s.parentName },
          phone: s.parentPhone,
          address: s.user.address
        }
      })),
      pendingLeaves
    });
  } catch (error: any) {
    console.error("Principal Portal API Error:", error);
    return res.status(500).json({ success: false, error: "Failed to retrieve principal dashboard data" });
  }
});

// --- CLERK PORTAL DATA ---
router.get("/clerk", async (req: Request, res: Response) => {
  try {
    const students = await prisma.studentProfile.findMany({
      include: { user: true },
      orderBy: { class: "asc" }
    });

    const books = await prisma.book.findMany({
      orderBy: { title: "asc" }
    });

    // Mock clerk stats
    const feeCollected = 450000;
    const pendingFeesCount = 12;

    return res.json({
      success: true,
      students: students.map(s => ({
        ...s,
        rollNo: s.rollNumber,
        parent: {
          user: { name: s.parentName },
          phone: s.parentPhone,
          address: s.user.address
        }
      })),
      books,
      metrics: {
        feeCollected,
        pendingFeesCount
      }
    });
  } catch (error: any) {
    console.error("Clerk Portal API Error:", error);
    return res.status(500).json({ success: false, error: "Failed to retrieve clerk portal data" });
  }
});

// --- PEON PORTAL DATA ---
router.get("/peon", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;

    if (!userId) {
      return res.status(400).json({ success: false, error: "Missing user ID in session" });
    }

    const duties = await prisma.dutySchedule.findMany({
      where: { peonId: userId },
      orderBy: { date: "desc" }
    });

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      },
      orderBy: { date: "desc" },
      take: 6
    });

    return res.json({
      success: true,
      duties,
      announcements
    });
  } catch (error: any) {
    console.error("Peon Portal API Error:", error);
    return res.status(500).json({ success: false, error: "Failed to retrieve peon duties list" });
  }
});

// --- SECURITY GUARD PORTAL DATA ---
router.get("/security-guard", async (req: Request, res: Response) => {
  try {
    const visitorLogs = await prisma.visitorLog.findMany({
      orderBy: { checkInTime: "desc" },
      take: 20
    });

    return res.json({
      success: true,
      visitorLogs
    });
  } catch (error: any) {
    console.error("Security Guard Portal API Error:", error);
    return res.status(500).json({ success: false, error: "Failed to retrieve visitor logs" });
  }
});

// --- ADMIN PORTAL DATA ---
router.get("/admin", async (req: Request, res: Response) => {
  try {
    const studentCount = await prisma.studentProfile.count();
    const teacherCount = await prisma.teacherProfile.count();
    const bookCount = await prisma.book.count();

    const students = await prisma.studentProfile.findMany({
      include: { user: true },
      orderBy: { class: "asc" }
    });

    const teachers = await prisma.teacherProfile.findMany({
      include: { user: true },
      orderBy: { employeeId: "asc" }
    });

    const books = await prisma.book.findMany({
      orderBy: { title: "asc" }
    });

    const announcements = await prisma.announcement.findMany({
      orderBy: { date: "desc" }
    });

    const auditLogs = await prisma.auditLog.findMany({
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: 30
    });

    const mappedLogs = auditLogs.map((log: any) => ({
      ...log,
      time: new Date(log.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      }),
      user: log.actor?.name || log.actorId || "System"
    }));

    return res.json({
      success: true,
      metrics: { studentCount, teacherCount, bookCount },
      students: students.map(s => ({
        ...s,
        rollNo: s.rollNumber,
        parent: {
          user: { name: s.parentName },
          phone: s.parentPhone,
          address: s.user.address
        }
      })),
      teachers,
      books,
      announcements,
      auditLogs: mappedLogs
    });
  } catch (error: any) {
    console.error("Admin Portal API Error:", error);
    return res.status(500).json({ success: false, error: "Failed to retrieve admin logs" });
  }
});


// ==========================================
// 2. ADMIN USER MANAGEMENT CRUD (PROMPT TARGETED)
// ==========================================

// --- GET: Fetch all users ---
router.get("/admin/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        studentProfile: true,
        teacherProfile: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ success: true, users });
  } catch (error) {
    console.error("Admin Fetch Users Error:", error);
    return res.status(500).json({ success: false, error: "Failed to load user registries list" });
  }
});

// --- POST: Create User ---
router.post("/admin/users", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const actorId = authReq.user?.id || "";

    const {
      name, email, dateOfBirth, role, phone, address, profileImage,
      // Student profile additions
      className, section, rollNumber, admissionNo, parentName, parentPhone, parentEmail,
      // Teacher profile additions
      employeeId, department, subjects, qualification
    } = req.body;

    if (!name || !email || !dateOfBirth || !role) {
      return res.status(400).json({ success: false, error: "Name, Email, Date of Birth, and Role are required." });
    }

    const dob = new Date(dateOfBirth);
    const generatedPassword = generateUserPassword(email, dob);
    const passwordHash = await bcrypt.hash(generatedPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create base User
      const user = await tx.user.create({
        data: {
          name,
          email: email.trim().toLowerCase(),
          passwordHash,
          dateOfBirth: dob,
          role,
          phone,
          address,
          profileImage,
          isActive: true
        }
      });

      // 2. Attach Profiles based on selected role
      if (role === "STUDENT") {
        if (!className || !section || !rollNumber || !admissionNo || !parentName || !parentPhone) {
          throw new Error("Missing student profile fields class, section, rollNumber, admissionNo, parentName, parentPhone");
        }
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            class: className,
            section,
            rollNumber,
            admissionNo,
            parentName,
            parentPhone,
            parentEmail
          }
        });
      } else if (role === "TEACHER") {
        if (!employeeId || !department || !qualification) {
          throw new Error("Missing teacher profile fields employeeId, department, qualification");
        }
        await tx.teacherProfile.create({
          data: {
            userId: user.id,
            employeeId,
            department,
            subjects: subjects || [],
            qualification,
            joiningDate: new Date()
          }
        });
      }

      return user;
    });

    // Log the creation
    await logAudit(actorId, "USER_CREATE", `User: ${email} (Role: ${role})`, { name, email, role });

    // Send Welcome Email Simulation Log
    console.log(`\n======================================================`);
    console.log(`[WELCOME EMAIL SENT TO ${email}]`);
    console.log(`Credentials:\nUsername/Email: ${email}\nPassword: ${generatedPassword}`);
    console.log(`======================================================\n`);

    return res.json({
      success: true,
      message: "User registered successfully",
      user: result
    });
  } catch (error: any) {
    console.error("Admin User Create Error:", error);
    if (error.message && error.message.startsWith("Missing")) {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, error: "A user with this Email or Registration ID already exists" });
    }
    return res.status(500).json({ success: false, error: "Failed to create user registry profile" });
  }
});

// --- PUT: Update User ---
router.put("/admin/users/:id", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const actorId = authReq.user?.id || "";
    const targetUserId = req.params.id;

    const {
      name, email, dateOfBirth, role, phone, address, profileImage, isActive,
      className, section, rollNumber, admissionNo, parentName, parentPhone, parentEmail,
      employeeId, department, subjects, qualification
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { studentProfile: true, teacherProfile: true }
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (email !== undefined) updatedData.email = email.trim().toLowerCase();
    if (phone !== undefined) updatedData.phone = phone;
    if (address !== undefined) updatedData.address = address;
    if (profileImage !== undefined) updatedData.profileImage = profileImage;
    if (role !== undefined) updatedData.role = role;
    if (isActive !== undefined) updatedData.isActive = isActive;

    if (dateOfBirth !== undefined) {
      const newDob = new Date(dateOfBirth);
      updatedData.dateOfBirth = newDob;
      // Regenerate password hash if DOB changes as requested
      const generatedPassword = generateUserPassword(email || existingUser.email, newDob);
      updatedData.passwordHash = await bcrypt.hash(generatedPassword, 12);
      console.log(`[PASSWORD UPDATE] Password regenerated for ${email || existingUser.email}: ${generatedPassword}`);
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update core user
      const user = await tx.user.update({
        where: { id: targetUserId },
        data: updatedData
      });

      // Handle role-specific profiles
      if (user.role === "STUDENT") {
        const studentData: any = {};
        if (className !== undefined) studentData.class = className;
        if (section !== undefined) studentData.section = section;
        if (rollNumber !== undefined) studentData.rollNumber = rollNumber;
        if (admissionNo !== undefined) studentData.admissionNo = admissionNo;
        if (parentName !== undefined) studentData.parentName = parentName;
        if (parentPhone !== undefined) studentData.parentPhone = parentPhone;
        if (parentEmail !== undefined) studentData.parentEmail = parentEmail;

        await tx.studentProfile.upsert({
          where: { userId: targetUserId },
          update: studentData,
          create: {
            userId: targetUserId,
            class: className || "10",
            section: section || "A",
            rollNumber: rollNumber || "1",
            admissionNo: admissionNo || `DPS-2026-${Math.floor(1000+Math.random()*9000)}`,
            parentName: parentName || "Parent",
            parentPhone: parentPhone || "+919937000000",
            parentEmail
          }
        });
      } else if (user.role === "TEACHER") {
        const teacherData: any = {};
        if (employeeId !== undefined) teacherData.employeeId = employeeId;
        if (department !== undefined) teacherData.department = department;
        if (subjects !== undefined) teacherData.subjects = subjects;
        if (qualification !== undefined) teacherData.qualification = qualification;

        await tx.teacherProfile.upsert({
          where: { userId: targetUserId },
          update: teacherData,
          create: {
            userId: targetUserId,
            employeeId: employeeId || `DPS-T-${Math.floor(100+Math.random()*900)}`,
            department: department || "Science",
            subjects: subjects || [],
            qualification: qualification || "B.Ed",
            joiningDate: new Date()
          }
        });
      }

      return user;
    });

    await logAudit(actorId, "USER_UPDATE", `User: ${result.email}`, { targetUserId });

    return res.json({
      success: true,
      message: "User profile updated successfully",
      user: result
    });
  } catch (error: any) {
    console.error("Admin User Update Error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ success: false, error: "Unique constraint validation failed (Email / Admission No already in use)" });
    }
    return res.status(500).json({ success: false, error: "Failed to update user profile" });
  }
});

// --- DELETE: Soft delete / Deactivate User ---
router.delete("/admin/users/:id", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const actorId = authReq.user?.id || "";
    const targetUserId = req.params.id;

    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: false }
    });

    await logAudit(actorId, "USER_DEACTIVATE", `User: ${user.email}`, { targetUserId });

    return res.json({
      success: true,
      message: `User ${user.email} deactivated successfully.`
    });
  } catch (error) {
    console.error("Admin User Deactivate Error:", error);
    return res.status(500).json({ success: false, error: "Failed to deactivate user registry entry" });
  }
});

// --- GET: Fetch Audit Logs (ADMIN & PRINCIPAL ONLY) ---
router.get("/admin/audit-logs", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const role = authReq.user?.role;

    if (role !== "ADMIN" && role !== "PRINCIPAL") {
      return res.status(403).json({ success: false, error: "Unauthorized access to system audit logs" });
    }

    const auditLogs = await prisma.auditLog.findMany({
      include: {
        actor: {
          select: { name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return res.json({ success: true, auditLogs });
  } catch (error) {
    console.error("Audit Logs API Error:", error);
    return res.status(500).json({ success: false, error: "Failed to load audit logs registry" });
  }
});


// ==========================================
// 3. DASHBOARD OPERATIONS & MOCK RECORD TRIGGERS
// ==========================================

// --- SUBMIT LEAVE REQUEST ---
router.post("/leaves", async (req: Request, res: Response) => {
  try {
    const { userId, startDate, endDate, reason } = req.body;
    if (!userId || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, error: "Missing leave parameters" });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: "PENDING"
      }
    });

    return res.json({ success: true, leaveRequest: leave });
  } catch (error) {
    console.error("Filing Leave Error:", error);
    return res.status(500).json({ success: false, error: "Failed to submit leave application" });
  }
});

// --- GET LEAVES HISTORY ---
router.get("/leaves", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ success: false, error: "Missing User ID parameter" });
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { appliedDate: "desc" }
    });

    return res.json({ success: true, leaves });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch leave history" });
  }
});

// --- POST: Approve/Reject Leave ---
router.post("/leaves/update", async (req: Request, res: Response) => {
  try {
    const { leaveId, status, comments } = req.body;
    if (!leaveId || !status) {
      return res.status(400).json({ success: false, error: "Missing leave update parameters" });
    }

    const leave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status, comments }
    });

    return res.json({ success: true, leaveRequest: leave });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to process leave request action" });
  }
});

// --- POST: Mark Class Attendance (TEACHER) ---
router.post("/teacher/attendance", async (req: Request, res: Response) => {
  try {
    const { date, records, teacherId } = req.body;
    if (!date || !records || !Array.isArray(records) || !teacherId) {
      return res.status(400).json({ success: false, error: "Missing attendance marking records parameters" });
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    for (const rec of records) {
      await prisma.attendance.upsert({
        where: {
          studentProfileId_date_subject: {
            studentProfileId: rec.studentId, // maps to studentProfileId in database
            date: parsedDate,
            subject: rec.subject || ""
          }
        },
        update: {
          status: rec.status,
          markedById: teacherId
        },
        create: {
          studentProfileId: rec.studentId,
          date: parsedDate,
          status: rec.status,
          subject: rec.subject || "",
          markedById: teacherId
        }
      });
    }

    return res.json({ success: true, message: "Attendance marked successfully" });
  } catch (error: any) {
    console.error("Teacher Attendance API Error:", error);
    return res.status(500).json({ success: false, error: "Failed to save attendance registry" });
  }
});

// --- POST: Upload Marks/Grades (TEACHER) ---
router.post("/teacher/grades", async (req: Request, res: Response) => {
  try {
    const { studentId, subject, examType, theoryMarks, practicalMarks, maxMarks, term, academicYear } = req.body;
    if (!studentId || !subject || !examType || theoryMarks === undefined || !maxMarks) {
      return res.status(400).json({ success: false, error: "Missing grade fields" });
    }

    const theory = Number(theoryMarks);
    const practical = Number(practicalMarks || 0);
    const total = theory + practical;
    const max = Number(maxMarks);
    const pct = (total / max) * 100;

    let gradeLetter = "D";
    if (pct >= 91) gradeLetter = "A1";
    else if (pct >= 81) gradeLetter = "A2";
    else if (pct >= 71) gradeLetter = "B1";
    else if (pct >= 61) gradeLetter = "B2";
    else if (pct >= 51) gradeLetter = "C1";
    else if (pct >= 41) gradeLetter = "C2";

    const grade = await prisma.grade.create({
      data: {
        studentProfileId: studentId,
        subject,
        examType,
        theoryMarks: theory,
        practicalMarks: practical,
        totalMarks: total,
        maxMarks: max,
        grade: gradeLetter,
        term: term || "Term 1",
        academicYear: academicYear || "2025-2026"
      }
    });

    return res.json({ success: true, gradeCard: grade });
  } catch (error) {
    console.error("Teacher Upload Grades Error:", error);
    return res.status(500).json({ success: false, error: "Failed to save student grade marks" });
  }
});

// --- POST: Log Visitor entry (SECURITY GUARD) ---
router.post("/security-guard/visitor", async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const guardId = authReq.user?.id || "";

    const { visitorName, visitorPhone, purpose, vehicleNumber } = req.body;
    if (!visitorName || !visitorPhone || !purpose) {
      return res.status(400).json({ success: false, error: "Name, Phone, and Purpose are required." });
    }

    const log = await prisma.visitorLog.create({
      data: {
        guardId,
        visitorName,
        visitorPhone,
        purpose,
        vehicleNumber,
        checkInTime: new Date()
      }
    });

    return res.json({ success: true, visitorLog: log });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to register visitor gate entry" });
  }
});

// --- POST: Checkout Visitor (SECURITY GUARD) ---
router.post("/security-guard/checkout", async (req: Request, res: Response) => {
  try {
    const { logId } = req.body;
    if (!logId) {
      return res.status(400).json({ success: false, error: "Missing log ID" });
    }

    const log = await prisma.visitorLog.update({
      where: { id: logId },
      data: { checkOutTime: new Date() }
    });

    return res.json({ success: true, visitorLog: log });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to checkout visitor" });
  }
});

// --- POST: Complete Duty (PEON) ---
router.post("/peon/complete-duty", async (req: Request, res: Response) => {
  try {
    const { dutyId } = req.body;
    if (!dutyId) {
      return res.status(400).json({ success: false, error: "Missing duty ID" });
    }

    const duty = await prisma.dutySchedule.update({
      where: { id: dutyId },
      data: { status: "COMPLETED" }
    });

    return res.json({ success: true, duty });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to update duty schedule status" });
  }
});

// --- POST: Create Announcement Notice ---
router.post("/admin/announcements", async (req: Request, res: Response) => {
  try {
    const { title, content, targetRole, category, authorId, endDate } = req.body;
    if (!title || !content || !targetRole || !category || !authorId) {
      return res.status(400).json({ success: false, error: "Missing required notice announcement fields" });
    }

    const notice = await prisma.announcement.create({
      data: {
        title,
        content,
        targetRole,
        category,
        authorId,
        endDate: endDate ? new Date(endDate) : null
      }
    });

    return res.json({ success: true, announcement: notice });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to publish school notice circular" });
  }
});

// --- GET: Fetch all announcements list ---
router.get("/announcements", async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: { date: "desc" }
    });
    const archivedAnnouncements = await prisma.announcement.findMany({
      where: {
        endDate: { lt: now }
      },
      orderBy: { date: "desc" }
    });
    return res.json({ success: true, announcements, archivedAnnouncements });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch notices list" });
  }
});

export default router;
