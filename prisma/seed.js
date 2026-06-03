const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database...');
  await prisma.leaveRequest.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.bookIssue.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.feePayment.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.busRoute.deleteMany({});

  console.log('Seeding database tables...');

  // --- 1. BUS ROUTES ---
  const route1 = await prisma.busRoute.create({
    data: {
      routeName: 'Route 1: Sector 1 & Sector 2 Township',
      vehicleNo: 'OD-10-B-2345',
      driverName: 'Sanjay Kumar Patra',
      driverPhone: '+91 94371 23456',
      stops: JSON.stringify([
        { name: 'Nalco Township Gate 1', time: '07:15 AM' },
        { name: 'Sector 1 Main Chowk', time: '07:25 AM' },
        { name: 'Sector 2 Shopping Complex', time: '07:35 AM' },
        { name: 'DPS School Campus', time: '07:50 AM' }
      ]),
      coordinates: JSON.stringify([
        { lat: 18.7770, lng: 83.0010 },
        { lat: 18.7785, lng: 83.0030 },
        { lat: 18.7800, lng: 83.0055 },
        { lat: 18.7820, lng: 83.0080 }
      ])
    }
  });

  const route2 = await prisma.busRoute.create({
    data: {
      routeName: 'Route 2: Nalco Hill Top & Mathalput',
      vehicleNo: 'OD-10-B-8765',
      driverName: 'Rajendra Prasad Naik',
      driverPhone: '+91 94378 87654',
      stops: JSON.stringify([
        { name: 'Mathalput Junction', time: '07:10 AM' },
        { name: 'Hill Top Township Block A', time: '07:25 AM' },
        { name: 'Hill Top Market Complex', time: '07:35 AM' },
        { name: 'DPS School Campus', time: '07:55 AM' }
      ]),
      coordinates: JSON.stringify([
        { lat: 18.7610, lng: 82.9850 },
        { lat: 18.7650, lng: 82.9910 },
        { lat: 18.7700, lng: 82.9980 },
        { lat: 18.7820, lng: 83.0080 }
      ])
    }
  });

  // --- 2. ADMIN USER ---
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dpsdamanjodi.edu.in',
      passwordHash: 'admin123', // In production, hash this password
      role: 'ADMIN',
      name: 'Dr. Sujata Mohapatra',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    }
  });

  // --- 3. TEACHER USERS ---
  const teacherUser1 = await prisma.user.create({
    data: {
      email: 'teacher@dpsdamanjodi.edu.in',
      passwordHash: 'teacher123',
      role: 'TEACHER',
      name: 'Sunita Sharma',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
    }
  });
  const teacher1 = await prisma.teacher.create({
    data: {
      userId: teacherUser1.id,
      employeeId: 'DPS-T-101',
      department: 'Mathematics',
      qualification: 'M.Sc (Mathematics), B.Ed',
      phone: '+91 98612 34567',
      classTeacherOfClass: '10',
      classTeacherOfSection: 'A'
    }
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      email: 'amit.das@dpsdamanjodi.edu.in',
      passwordHash: 'teacher123',
      role: 'TEACHER',
      name: 'Amit Kumar Das',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    }
  });
  const teacher2 = await prisma.teacher.create({
    data: {
      userId: teacherUser2.id,
      employeeId: 'DPS-T-102',
      department: 'Science',
      qualification: 'M.Sc (Physics), Ph.D',
      phone: '+91 98610 98765'
    }
  });

  const teacherUser3 = await prisma.user.create({
    data: {
      email: 'priya.patel@dpsdamanjodi.edu.in',
      passwordHash: 'teacher123',
      role: 'TEACHER',
      name: 'Priya Patel',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    }
  });
  const teacher3 = await prisma.teacher.create({
    data: {
      userId: teacherUser3.id,
      employeeId: 'DPS-T-103',
      department: 'English',
      qualification: 'M.A (English Literature), B.Ed',
      phone: '+91 94390 12345'
    }
  });

  // --- 4. PARENT USER & PROFILE ---
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@dpsdamanjodi.edu.in',
      passwordHash: 'parent123',
      role: 'PARENT',
      name: 'Ramesh Chandra Mohanty',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
    }
  });
  const parent = await prisma.parent.create({
    data: {
      userId: parentUser.id,
      occupation: 'Senior Manager, NALCO',
      relation: 'FATHER',
      phone: '+91 99370 54321',
      address: 'Quarter No. C-123, Nalco Township, Damanjodi, Koraput, Odisha - 763008'
    }
  });

  // --- 5. STUDENT USER & PROFILE ---
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'student@dpsdamanjodi.edu.in',
      passwordHash: 'student123',
      role: 'STUDENT',
      name: 'Rahul Mohanty',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200'
    }
  });
  const student1 = await prisma.student.create({
    data: {
      userId: studentUser1.id,
      admissionNo: 'DPS-2020-4351',
      class: '10',
      section: 'A',
      rollNo: 15,
      dateOfBirth: new Date('2011-04-12'),
      gender: 'Male',
      phone: '+91 99370 54321',
      address: 'Quarter No. C-123, Nalco Township, Damanjodi, Koraput, Odisha - 763008',
      bloodGroup: 'O+',
      cardQrCode: 'STUDENT:Rahul Mohanty:DPS-2020-4351',
      libraryCardNo: 'LIB-2020-88',
      parentId: parent.id,
      transportRouteId: route1.id,
      transportStop: 'Sector 1 Main Chowk'
    }
  });

  // Additional Students (for lists/class registers)
  const studentNames = [
    { name: 'Ananya Sen', email: 'ananya.sen@dpsdamanjodi.edu.in', rollNo: 1, gender: 'Female' },
    { name: 'Rohit Nayak', email: 'rohit.nayak@dpsdamanjodi.edu.in', rollNo: 24, gender: 'Male' },
    { name: 'Swati Das', email: 'swati.das@dpsdamanjodi.edu.in', rollNo: 32, gender: 'Female' }
  ];

  const studentsList = [];
  for (const s of studentNames) {
    const userObj = await prisma.user.create({
      data: {
        email: s.email,
        passwordHash: 'student123',
        role: 'STUDENT',
        name: s.name,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${s.name}`
      }
    });

    const studObj = await prisma.student.create({
      data: {
        userId: userObj.id,
        admissionNo: `DPS-2020-${1000 + Math.floor(Math.random() * 9000)}`,
        class: '10',
        section: 'A',
        rollNo: s.rollNo,
        dateOfBirth: new Date('2011-08-20'),
        gender: s.gender,
        address: 'Nalco Township, Damanjodi',
        parentId: parent.id, // Linking to the same parent for convenience
        transportRouteId: route1.id,
        transportStop: 'Sector 2 Shopping Complex'
      }
    });
    studentsList.push(studObj);
  }

  // --- 6. ATTENDANCE (Rahul Mohanty - last 30 days) ---
  console.log('Seeding attendance...');
  const today = new Date();
  for (let i = 35; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Default status: 90% Present, 5% Late, 5% Absent
    let status = 'PRESENT';
    const rand = Math.random();
    if (rand > 0.95) {
      status = 'ABSENT';
    } else if (rand > 0.90) {
      status = 'LATE';
    }

    // Daily Attendance
    await prisma.attendance.create({
      data: {
        studentId: student1.id,
        date: new Date(date.setHours(0, 0, 0, 0)),
        status: status,
        markedById: teacher1.id
      }
    });

    // Seed attendance for other students too
    for (const stud of studentsList) {
      let sStatus = Math.random() > 0.95 ? 'ABSENT' : 'PRESENT';
      await prisma.attendance.create({
        data: {
          studentId: stud.id,
          date: new Date(date.setHours(0, 0, 0, 0)),
          status: sStatus,
          markedById: teacher1.id
        }
      });
    }
  }

  // --- 7. GRADES (Rahul Mohanty) ---
  console.log('Seeding grades...');
  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Odia', 'Computer Science'];
  const exams = [
    { type: 'UNIT_1', max: 40, base: 34, factor: 5, term: 'Term 1' },
    { type: 'MID_TERM', max: 80, base: 68, factor: 10, term: 'Term 1' },
    { type: 'UNIT_2', max: 40, base: 35, factor: 4, term: 'Term 2' },
    { type: 'FINAL', max: 100, base: 88, factor: 10, term: 'Term 2' }
  ];

  const calculateGradeString = (percentage) => {
    if (percentage >= 91) return 'A1';
    if (percentage >= 81) return 'A2';
    if (percentage >= 71) return 'B1';
    if (percentage >= 61) return 'B2';
    if (percentage >= 51) return 'C1';
    if (percentage >= 41) return 'C2';
    return 'D';
  };

  for (const subject of subjects) {
    for (const exam of exams) {
      const theory = exam.base + (Math.random() * exam.factor) - (exam.factor / 2);
      const roundedTheory = Math.min(exam.max, Math.max(0, Math.round(theory * 10) / 10));
      const total = roundedTheory;
      const percentage = (total / exam.max) * 100;

      await prisma.grade.create({
        data: {
          studentId: student1.id,
          subject: subject,
          examType: exam.type,
          theoryMarks: roundedTheory,
          practicalMarks: 0,
          totalMarks: total,
          maxMarks: exam.max,
          grade: calculateGradeString(percentage),
          term: exam.term,
          academicYear: '2025-2026'
        }
      });
    }
  }

  // --- 8. FEE PAYMENTS ---
  console.log('Seeding fees...');
  const feeItems = [
    { title: 'Q1 Tuition & Activities Fee', amount: 15400, due: '2025-04-15', status: 'PAID', paid: '2025-04-10', method: 'UPI', receipt: 'REC-2025-0012' },
    { title: 'Q2 Tuition & Transport Fee', amount: 18900, due: '2025-07-15', status: 'PAID', paid: '2025-07-12', method: 'CARD', receipt: 'REC-2025-0582' },
    { title: 'Q3 Tuition Fee', amount: 15400, due: '2025-10-15', status: 'PAID', paid: '2025-10-14', method: 'NET_BANKING', receipt: 'REC-2025-1102' },
    { title: 'Q4 Tuition & Transport Fee', amount: 18900, due: '2026-01-15', status: 'UNPAID' }
  ];

  for (const item of feeItems) {
    await prisma.feePayment.create({
      data: {
        studentId: student1.id,
        title: item.title,
        amount: item.amount,
        dueDate: new Date(item.due),
        status: item.status,
        paidDate: item.paid ? new Date(item.paid) : null,
        paymentMethod: item.method || null,
        transactionId: item.paid ? 'TXN' + Math.floor(10000000 + Math.random() * 90000000) : null,
        receiptNo: item.receipt || null
      }
    });
  }

  // --- 9. LIBRARY BOOKS & ISSUES ---
  console.log('Seeding library...');
  const books = [
    { title: 'Higher Algebra', author: 'Hall & Knight', isbn: '9788120304322', category: 'Mathematics', copies: 5, loc: 'Shelf M-3' },
    { title: 'Fundamentals of Physics', author: 'Resnick & Halliday', isbn: '9781118230718', category: 'Science', copies: 4, loc: 'Shelf S-8' },
    { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', category: 'Science', copies: 3, loc: 'Shelf S-11' },
    { title: 'Julius Caesar', author: 'William Shakespeare', isbn: '9780743482783', category: 'Literature', copies: 6, loc: 'Shelf L-1' },
    { title: 'Computer Science with Python', author: 'Sumita Arora', isbn: '9789389635032', category: 'Computer Science', copies: 10, loc: 'Shelf CS-2' },
    { title: 'India Since Independence', author: 'Bipan Chandra', isbn: '9780143102229', category: 'Social Studies', copies: 3, loc: 'Shelf SS-5' }
  ];

  for (const b of books) {
    const createdBook = await prisma.book.create({
      data: {
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        category: b.category,
        totalCopies: b.copies,
        availableCopies: b.copies - 1, // assume one copy issued
        location: b.loc
      }
    });

    // Create an active issue for Student 1
    if (b.category === 'Science' && b.title.includes('Physics')) {
      const issue = new Date();
      issue.setDate(today.getDate() - 10);
      const due = new Date();
      due.setDate(today.getDate() + 4);

      await prisma.bookIssue.create({
        data: {
          bookId: createdBook.id,
          studentId: student1.id,
          issueDate: issue,
          dueDate: due,
          status: 'ISSUED'
        }
      });
    }

    // Create a returned issue for Student 1
    if (b.category === 'Literature') {
      const issue = new Date();
      issue.setDate(today.getDate() - 25);
      const due = new Date();
      due.setDate(today.getDate() - 10);
      const ret = new Date();
      ret.setDate(today.getDate() - 12);

      await prisma.bookIssue.create({
        data: {
          bookId: createdBook.id,
          studentId: student1.id,
          issueDate: issue,
          dueDate: due,
          returnDate: ret,
          status: 'RETURNED'
        }
      });
    }
  }

  // --- 10. ANNOUNCEMENTS ---
  console.log('Seeding announcements...');
  const alerts = [
    { title: 'PTM for Class X Students Scheduled', content: 'The Parent-Teacher Meeting (PTM) for Class X students is scheduled for Saturday, June 14th, from 9:00 AM to 12:30 PM. All parents are requested to attend to discuss terminal exam performance.', role: 'PARENT', cat: 'URGENT' },
    { title: 'Annual Day Celebrations & Theme Announcement', content: 'We are excited to announce that the Annual Cultural Day "UDGAM 2026" will be celebrated on November 20th. Registrations for dance, drama, and music events are now open in the school office.', role: 'ALL', cat: 'EVENT' },
    { title: 'Summer Vacations Rescheduling Notice', content: 'In view of the intense heatwave, the district administration has ordered rescheduling of summer break. DPS Damanjodi will remain closed from June 5th to June 25th. Online assignments have been uploaded.', role: 'ALL', cat: 'URGENT' },
    { title: 'New Reference Material Uploaded for Mathematics', content: 'Dear Students, CBSE board sample question papers and revision notes for Mathematics Chapter 3 (Linear Equations) have been uploaded to your dashboards.', role: 'STUDENT', cat: 'ACADEMIC' },
    { title: 'Staff Council Meeting on Examination Planning', content: 'A staff council meeting will be held in the Conference Hall at 2:30 PM on Friday to coordinate logistics for the upcoming Pre-Board examinations.', role: 'TEACHER', cat: 'GENERAL' }
  ];

  for (const alert of alerts) {
    await prisma.announcement.create({
      data: {
        title: alert.title,
        content: alert.content,
        targetRole: alert.role,
        category: alert.cat,
        authorId: adminUser.id
      }
    });
  }

  // --- 11. LEAVE REQUESTS ---
  console.log('Seeding leave requests...');
  await prisma.leaveRequest.create({
    data: {
      userId: studentUser1.id,
      role: 'STUDENT',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4),
      reason: 'Attending my elder cousin sister\'s wedding in Bhubaneswar.',
      status: 'APPROVED',
      comments: 'Approved. Ensure you cover the Math syllabus missed.',
      appliedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3)
    }
  });

  await prisma.leaveRequest.create({
    data: {
      userId: teacherUser2.id,
      role: 'TEACHER',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6),
      reason: 'Medical checkup and consultation in Koraput District Hospital.',
      status: 'PENDING',
      appliedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
