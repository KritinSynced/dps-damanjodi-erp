const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper to hash password based on Name and DOB
async function hashPasswordForUser(name, dobDate) {
  const cleanName = name.replace(/\s+/g, '');
  const day = String(dobDate.getDate()).padStart(2, '0');
  const month = String(dobDate.getMonth() + 1).padStart(2, '0');
  const year = dobDate.getFullYear();
  const rawPassword = `${cleanName}@${day}${month}${year}`;
  
  // Return bcrypt hash
  return bcrypt.hash(rawPassword, 12);
}

async function main() {
  console.log('Clearing existing database records...');
  
  // Delete in order to satisfy foreign key constraints
  await prisma.otpRecord.deleteMany({});
  await prisma.loginAttempt.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.bookIssue.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.dutySchedule.deleteMany({});
  await prisma.visitorLog.deleteMany({});
  
  await prisma.studentProfile.deleteMany({});
  await prisma.teacherProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleared. Starting seed execution...');

  // 1. ADMIN USER
  const adminDob = new Date('2006-12-06');
  const adminHash = await bcrypt.hash('kritin006@06122006', 12);
  const adminUser = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'kritin.panda@gmail.com',
      passwordHash: adminHash,
      dateOfBirth: adminDob,
      role: 'ADMIN',
      isActive: true,
      phone: '+919937012345',
      address: 'DPS Campus, Damanjodi, Odisha',
    }
  });
  console.log(`Seeded Admin User: ${adminUser.email} (Password: kritin006@06122006)`);

  // 2. PRINCIPAL USER
  const principalDob = new Date('2001-01-11');
  const principalHash = await bcrypt.hash('kritin.yt@11012001', 12);
  const principalUser = await prisma.user.create({
    data: {
      name: 'Principal User',
      email: 'kritin.yt@gmail.com',
      passwordHash: principalHash,
      dateOfBirth: principalDob,
      role: 'PRINCIPAL',
      isActive: true,
      phone: '+919937023456',
      address: 'Principal Bungalow, DPS Campus, Damanjodi, Odisha',
    }
  });
  console.log(`Seeded Principal User: ${principalUser.email} (Password: kritin.yt@11012001)`);

  // 3. TEACHER USER
  const teacherDob = new Date('2006-06-29');
  const teacherHash = await bcrypt.hash('smartadi29@29062006', 12);
  const teacherUser = await prisma.user.create({
    data: {
      name: 'Teacher User',
      email: 'smartadi29@gmail.com',
      passwordHash: teacherHash,
      dateOfBirth: teacherDob,
      role: 'TEACHER',
      isActive: true,
      phone: '+919937034567',
      address: 'Staff Quarters Type IV, Damanjodi, Odisha',
    }
  });

  const teacherProfile = await prisma.teacherProfile.create({
    data: {
      userId: teacherUser.id,
      employeeId: 'DPS-T-101',
      department: 'Science',
      subjects: ['Physics', 'Chemistry'],
      qualification: 'M.Sc (Physics), B.Ed',
      joiningDate: new Date('2018-06-01'),
    }
  });
  console.log(`Seeded Teacher User: ${teacherUser.email} (Password: smartadi29@29062006)`);

  // 4. STUDENT USER
  const studentDob = new Date('2006-12-06');
  const studentHash = await bcrypt.hash('technobeast00@06122006', 12);
  const studentUser = await prisma.user.create({
    data: {
      name: 'Student User',
      email: 'technobeast006@gmail.com',
      passwordHash: studentHash,
      dateOfBirth: studentDob,
      role: 'STUDENT',
      isActive: true,
      phone: '+919937045678',
      address: 'NALCO Township Sector 2, Damanjodi, Odisha',
    }
  });

  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      class: '10',
      section: 'A',
      rollNumber: '15',
      admissionNo: 'DPS-2020-0015',
      parentName: 'Ramesh Mohanty',
      parentPhone: '+919876543210',
      parentEmail: 'ramesh.mohanty@gmail.com',
    }
  });
  console.log(`Seeded Student User: ${studentUser.email} (Password: technobeast00@06122006)`);

  // 5. CLERK USER
  const clerkDob = new Date('2006-06-29');
  const clerkHash = await bcrypt.hash('adishreepanda29@29062006', 12);
  const clerkUser = await prisma.user.create({
    data: {
      name: 'Clerk User',
      email: 'adishreepanda29@gmail.com',
      passwordHash: clerkHash,
      dateOfBirth: clerkDob,
      role: 'CLERK',
      isActive: true,
      phone: '+919937056789',
      address: 'NALCO Township Sector 1, Damanjodi, Odisha',
    }
  });
  console.log(`Seeded Clerk User: ${clerkUser.email} (Password: adishreepanda29@29062006)`);

  // 6. PEON USER
  const peonDob = new Date('2005-08-16');
  const peonHash = await bcrypt.hash('janmajay9877@16082005', 12);
  const peonUser = await prisma.user.create({
    data: {
      name: 'Peon User',
      email: 'janmajay9877@gmail.com',
      passwordHash: peonHash,
      dateOfBirth: peonDob,
      role: 'PEON',
      isActive: true,
      phone: '+919937067890',
      address: 'Peon quarters, Sector 3, Damanjodi, Odisha',
    }
  });
  console.log(`Seeded Peon User: ${peonUser.email} (Password: janmajay9877@16082005)`);

  // 7. SECURITY GUARD USER
  const guardDob = new Date('2007-02-26');
  const guardHash = await bcrypt.hash('anirudhdash143@26022007', 12);
  const guardUser = await prisma.user.create({
    data: {
      name: 'Guard User',
      email: 'anirudhdash143@gmail.com',
      passwordHash: guardHash,
      dateOfBirth: guardDob,
      role: 'SECURITY_GUARD',
      isActive: true,
      phone: '+919937078901',
      address: 'Security Barracks, DPS Gate, Damanjodi, Odisha',
    }
  });
  console.log(`Seeded Security Guard User: ${guardUser.email} (Password: anirudhdash143@26022007)`);

  // --- SEED SUPPORTING METADATA RECORDS ---

  // Announcements
  console.log('Seeding Announcements notices...');
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Mid-Term Examinations Schedule',
        content: 'The Mid-Term exams for Classes VI to XII will commence from September 10th. The detailed timetable has been uploaded in the portal.',
        targetRole: 'ALL',
        category: 'ACADEMIC',
        authorId: principalUser.id,
        date: new Date('2026-06-20'),
      },
      {
        title: 'Annual Sports Meet 2026',
        content: 'Registration is open for the upcoming Annual Athletics Meet scheduled in November. Reach out to the physical education dept.',
        targetRole: 'STUDENT',
        category: 'EVENT',
        authorId: principalUser.id,
        date: new Date('2026-06-22'),
      },
      {
        title: 'Emergency Maintenance Closure',
        content: 'The main block laboratories will remain closed on June 28th for electrical upgrade maintenance works.',
        targetRole: 'TEACHER',
        category: 'URGENT',
        authorId: adminUser.id,
        date: new Date('2026-06-23'),
      }
    ]
  });

  // Attendance for student
  console.log('Seeding student Attendance tracker...');
  const baseDate = new Date('2026-06-01');
  const attendanceData = [];
  for (let i = 0; i < 15; i++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + i);
    
    // Skip sundays (day 0)
    if (currentDate.getDay() === 0) continue;

    attendanceData.push({
      studentProfileId: studentProfile.id,
      date: currentDate,
      status: i === 7 ? 'ABSENT' : i === 12 ? 'LATE' : 'PRESENT',
      subject: '', // General daily attendance
      markedById: teacherUser.id
    });
  }
  await prisma.attendance.createMany({ data: attendanceData });

  // Grades for student
  console.log('Seeding student Grades cards...');
  await prisma.grade.createMany({
    data: [
      {
        studentProfileId: studentProfile.id,
        subject: 'Physics',
        examType: 'UNIT_1',
        theoryMarks: 23.5,
        practicalMarks: 0.0,
        totalMarks: 23.5,
        maxMarks: 25.0,
        grade: 'A1',
        term: 'Term 1',
        academicYear: '2025-2026',
      },
      {
        studentProfileId: studentProfile.id,
        subject: 'Chemistry',
        examType: 'UNIT_1',
        theoryMarks: 21.0,
        practicalMarks: 0.0,
        totalMarks: 21.0,
        maxMarks: 25.0,
        grade: 'A2',
        term: 'Term 1',
        academicYear: '2025-2026',
      },
      {
        studentProfileId: studentProfile.id,
        subject: 'Physics',
        examType: 'MID_TERM',
        theoryMarks: 62.0,
        practicalMarks: 28.0,
        totalMarks: 90.0,
        maxMarks: 100.0,
        grade: 'A1',
        term: 'Term 1',
        academicYear: '2025-2026',
      }
    ]
  });

  // Library catalog
  console.log('Seeding Library books...');
  const book1 = await prisma.book.create({
    data: {
      title: 'Concepts of Physics (Vol 1)',
      author: 'H.C. Verma',
      isbn: '9788177091878',
      category: 'Science',
      totalCopies: 5,
      availableCopies: 4,
      location: 'Rack S-4'
    }
  });

  const book2 = await prisma.book.create({
    data: {
      title: 'Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '9780553380163',
      category: 'Science',
      totalCopies: 3,
      availableCopies: 3,
      location: 'Rack S-6'
    }
  });

  const book3 = await prisma.book.create({
    data: {
      title: 'High School English Grammar',
      author: 'Wren & Martin',
      isbn: '9789352530144',
      category: 'Literature',
      totalCopies: 8,
      availableCopies: 7,
      location: 'Rack L-2'
    }
  });

  // Book Issues
  await prisma.bookIssue.create({
    data: {
      bookId: book1.id,
      studentProfileId: studentProfile.id,
      issueDate: new Date('2026-06-15'),
      dueDate: new Date('2026-06-30'),
      status: 'ISSUED',
    }
  });

  // Leave request
  await prisma.leaveRequest.create({
    data: {
      userId: studentUser.id,
      startDate: new Date('2026-06-25'),
      endDate: new Date('2026-06-26'),
      reason: 'Family wedding out of station.',
      status: 'PENDING',
    }
  });

  // Peon duty schedules
  console.log('Seeding Peon Duty schedules...');
  await prisma.dutySchedule.createMany({
    data: [
      {
        peonId: peonUser.id,
        task: 'Deliver files and circulars to Principal office',
        location: 'Main Administrative Block',
        timeSlot: '09:00 AM - 10:30 AM',
        status: 'COMPLETED',
        date: new Date('2026-06-24'),
      },
      {
        peonId: peonUser.id,
        task: 'Arrange conference room tables and projectors',
        location: 'Audio Visual Hall',
        timeSlot: '11:00 AM - 12:30 PM',
        status: 'PENDING',
        date: new Date('2026-06-24'),
      },
      {
        peonId: peonUser.id,
        task: 'Lock classrooms and check water valves post closure',
        location: 'Middle School wing',
        timeSlot: '04:00 PM - 05:00 PM',
        status: 'PENDING',
        date: new Date('2026-06-24'),
      }
    ]
  });

  // Guard visitor logs
  console.log('Seeding Visitor Gate logs...');
  await prisma.visitorLog.createMany({
    data: [
      {
        guardId: guardUser.id,
        visitorName: 'Subrat Mohanty',
        visitorPhone: '+919937000111',
        purpose: 'Parent meeting with Class Teacher (10-A)',
        vehicleNumber: 'OD-10-H-4321',
        checkInTime: new Date('2026-06-24T09:30:00Z'),
        checkOutTime: new Date('2026-06-24T10:45:00Z'),
      },
      {
        guardId: guardUser.id,
        visitorName: 'Ritesh Senapati',
        visitorPhone: '+919937000222',
        purpose: 'Delivery of lab chemicals',
        vehicleNumber: 'OD-10-G-9876',
        checkInTime: new Date('2026-06-24T11:15:00Z'),
        checkOutTime: null,
      }
    ]
  });

  // Audit Logs
  console.log('Seeding Audit action logs...');
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: adminUser.id,
        action: 'USER_REGISTRY_CREATE',
        target: 'Student User (student@dpsdamanjodi.edu.in)',
        metadata: { class: '10', section: 'A' },
        createdAt: new Date('2026-06-24T08:00:00Z'),
      },
      {
        actorId: adminUser.id,
        action: 'USER_REGISTRY_CREATE',
        target: 'Teacher User (teacher@dpsdamanjodi.edu.in)',
        metadata: { employeeId: 'DPS-T-101' },
        createdAt: new Date('2026-06-24T08:05:00Z'),
      },
      {
        actorId: principalUser.id,
        action: 'ANNOUNCEMENT_BROADCAST',
        target: 'Mid-Term Examinations Schedule Notice',
        metadata: { category: 'ACADEMIC' },
        createdAt: new Date('2026-06-24T08:15:00Z'),
      }
    ]
  });

  console.log('Seed seeding execution finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seeder execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
