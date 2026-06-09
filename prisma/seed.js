const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

// Common names for dynamic generation
const firstNamesBoys = [
  'Amit', 'Rahul', 'Rohit', 'Sanjay', 'Aditya', 'Abhishek', 'Rajesh', 'Vikram', 'Alok', 'Deepak',
  'Arjun', 'Vijay', 'Sunil', 'Manish', 'Karan', 'Vivek', 'Pranav', 'Rohan', 'Aarav', 'Kabir',
  'Dev', 'Ishaan', 'Kartik', 'Mayank', 'Piyush', 'Ritik', 'Shubham', 'Tushar', 'Varun', 'Yash',
  'Aniket', 'Ayush', 'Gaurav', 'Harish', 'Nikhil', 'Pankaj', 'Raman', 'Sandeep', 'Sourabh', 'Umesh'
];

const firstNamesGirls = [
  'Ananya', 'Swati', 'Priya', 'Neha', 'Pooja', 'Riya', 'Divya', 'Kajal', 'Aditi', 'Sneha',
  'Tanvi', 'Ishita', 'Anjali', 'Shreya', 'Meera', 'Kiran', 'Aisha', 'Nisha', 'Jyoti', 'Preeti',
  'Priyanka', 'Ritu', 'Sakshi', 'Sanjana', 'Tanushree', 'Urvashi', 'Vaishnali', 'Barkha', 'Charu', 'Deepika',
  'Aarti', 'Bhumika', 'Kavita', 'Manju', 'Payal', 'Rashmi', 'Sheetal', 'Sonali', 'Vandana', 'Yogita'
];

const lastNames = [
  'Mohanty', 'Nayak', 'Das', 'Patra', 'Jena', 'Sahu', 'Mishra', 'Pradhan', 'Behera', 'Rout',
  'Tripathy', 'Sen', 'Sharma', 'Patel', 'Dasgupta', 'Banerjee', 'Choudhury', 'Roy', 'Dwivedi', 'Jha',
  'Mahapatra', 'Naik', 'Panda', 'Prusty', 'Rao', 'Samal', 'Acharya', 'Satapathy', 'Parida', 'Lenka'
];

const fatherNames = [
  'Ramesh', 'Suresh', 'Debendra', 'Prasanna', 'Subhash', 'Ashok', 'Kishore', 'Bipin', 'Ganesh', 'Harihar',
  'Manoj', 'Dilip', 'Santosh', 'Pradeep', 'Rabindra', 'Satyabrata', 'Nilakantha', 'Balaram', 'Jagannath', 'Trilochan',
  'Binod', ' Kailash', 'Lalit', 'Manmath', 'Niranjan', 'Prafulla', 'Sudhir', 'Tapan', 'Uday', 'Yugal'
];

const occupations = [
  'Senior Manager, NALCO', 'Junior Engineer, NALCO', 'Assistant Executive, NALCO', 'Technician, NALCO',
  'School Teacher', 'Local Businessman', 'Government Officer', 'Bank Employee', 'Doctor', 'Contractor',
  'Manager, SBI', 'Officer, NALCO ERP', 'Lecturer, Government College', 'Consultant'
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('Clearing existing database...');
  await prisma.leaveRequest.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.bookIssue.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding database tables...');


  // --- 2. ADMIN USER ---
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dpsdamanjodi.edu.in',
      passwordHash: 'admin123',
      role: 'ADMIN',
      name: 'Dr. Sujata Mohapatra',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
    }
  });

  // --- 3. CLASS CONFIG & TEACHERS ---
  const classes = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const teachersMap = {};

  console.log('Seeding teachers for all classes...');
  
  // Create default teacher first
  const defaultTeacherUser = await prisma.user.create({
    data: {
      email: 'teacher@dpsdamanjodi.edu.in',
      passwordHash: 'teacher123',
      role: 'TEACHER',
      name: 'Sunita Sharma',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
    }
  });
  const defaultTeacherProfile = await prisma.teacher.create({
    data: {
      userId: defaultTeacherUser.id,
      employeeId: 'DPS-T-100',
      department: 'Mathematics',
      qualification: 'M.Sc (Mathematics), B.Ed',
      phone: '+91 98612 34567',
      classTeacherOfClass: '10',
      classTeacherOfSection: 'A'
    }
  });
  teachersMap['10'] = defaultTeacherProfile;

  // Create teachers for all other classes dynamically
  for (const c of classes) {
    if (c === '10') continue; // already created

    const cleanClassName = c.replace(/\s+/g, '').toLowerCase();
    const tUser = await prisma.user.create({
      data: {
        email: `teacher.${cleanClassName}@dpsdamanjodi.edu.in`,
        passwordHash: 'teacher123',
        role: 'TEACHER',
        name: `Teacher Class ${c}`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Teacher${c}`
      }
    });

    const tProfile = await prisma.teacher.create({
      data: {
        userId: tUser.id,
        employeeId: `DPS-T-${200 + classes.indexOf(c)}`,
        department: pickRandom(['Mathematics', 'Science', 'English', 'Social Studies', 'Odia', 'Hindi', 'Physical Education']),
        qualification: 'M.A / M.Sc, B.Ed',
        phone: `+91 98610 ${10000 + Math.floor(Math.random() * 90000)}`,
        classTeacherOfClass: c,
        classTeacherOfSection: 'A'
      }
    });
    
    teachersMap[c] = tProfile;
  }

  // --- 4. DYNAMIC STUDENTS AND UNIQUE PARENTS (20 PER CLASS) ---
  console.log('Generating students and parents in batches...');

  const usersToCreate = [];
  const parentsToCreate = [];
  const studentsToCreate = [];

  // Track the default student/parent to link them to the specific credentials
  const defaultStudentUserId = randomUUID();
  const defaultStudentProfileId = randomUUID();
  const defaultParentUserId = randomUUID();
  const defaultParentProfileId = randomUUID();

  // Add default parent user and profile
  usersToCreate.push({
    id: defaultParentUserId,
    email: 'parent@dpsdamanjodi.edu.in',
    passwordHash: 'parent123',
    role: 'PARENT',
    name: 'Ramesh Chandra Mohanty',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
  });
  parentsToCreate.push({
    id: defaultParentProfileId,
    userId: defaultParentUserId,
    occupation: 'Senior Manager, NALCO',
    relation: 'FATHER',
    phone: '+91 99370 54321',
    address: 'Quarter No. C-123, Nalco Township, Damanjodi, Koraput, Odisha - 763008'
  });

  // Add default student user and profile
  usersToCreate.push({
    id: defaultStudentUserId,
    email: 'student@dpsdamanjodi.edu.in',
    passwordHash: 'student123',
    role: 'STUDENT',
    name: 'Rahul Mohanty',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200'
  });
  studentsToCreate.push({
    id: defaultStudentProfileId,
    userId: defaultStudentUserId,
    admissionNo: 'DPS-2020-4351',
    class: '10',
    section: 'A',
    rollNo: 1,
    dateOfBirth: new Date('2011-04-12'),
    gender: 'Male',
    phone: '+91 99370 54321',
    address: 'Quarter No. C-123, Nalco Township, Damanjodi, Koraput, Odisha - 763008',
    bloodGroup: 'O+',
    cardQrCode: 'STUDENT:Rahul Mohanty:DPS-2020-4351',
    libraryCardNo: 'LIB-2020-88',
    parentId: defaultParentProfileId
  });

  // Generate 20 students per class
  const studentsCountPerClass = 20;

  for (const c of classes) {
    const isClass10 = c === '10';
    // If it's Class 10, start from index 1 (since index 0 is Rahul Mohanty). For others start from 0.
    const startIndex = isClass10 ? 1 : 0;

    for (let i = startIndex; i < studentsCountPerClass; i++) {
      const isBoy = Math.random() > 0.5;
      const firstName = isBoy ? pickRandom(firstNamesBoys) : pickRandom(firstNamesGirls);
      const lastName = pickRandom(lastNames);
      const studentName = `${firstName} ${lastName}`;
      const cleanName = studentName.toLowerCase().replace(/\s+/g, '.');
      
      const sUserId = randomUUID();
      const sProfileId = randomUUID();
      const pUserId = randomUUID();
      const pProfileId = randomUUID();

      // Parent user
      const fName = pickRandom(fatherNames);
      const parentName = `${fName} ${lastName}`;
      const cleanParentName = parentName.toLowerCase().replace(/\s+/g, '.');

      usersToCreate.push({
        id: pUserId,
        email: `parent.${cleanParentName}.${randomUUID().substring(0, 4)}@dpsdamanjodi.edu.in`,
        passwordHash: 'parent123',
        role: 'PARENT',
        name: parentName,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${parentName}`
      });

      parentsToCreate.push({
        id: pProfileId,
        userId: pUserId,
        occupation: pickRandom(occupations),
        relation: 'FATHER',
        phone: `+91 99370 ${10000 + Math.floor(Math.random() * 90000)}`,
        address: 'Nalco Township, Damanjodi, Koraput, Odisha'
      });

      // Student user
      usersToCreate.push({
        id: sUserId,
        email: `student.${cleanName}.${randomUUID().substring(0, 4)}@dpsdamanjodi.edu.in`,
        passwordHash: 'student123',
        role: 'STUDENT',
        name: studentName,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${studentName}`
      });

      // Student profile
      const birthYear = 2026 - (classes.indexOf(c) + 4); // Nursery starts around age 4
      studentsToCreate.push({
        id: sProfileId,
        userId: sUserId,
        admissionNo: `DPS-${birthYear + 4}-${1000 + Math.floor(Math.random() * 9000)}`,
        class: c,
        section: 'A',
        rollNo: i + 1,
        dateOfBirth: new Date(`${birthYear}-05-${10 + Math.floor(Math.random() * 18)}`),
        gender: isBoy ? 'Male' : 'Female',
        address: 'Nalco Township, Damanjodi',
        parentId: pProfileId
      });
    }
  }

  // Batch insert users, parents, and students
  console.log(`Inserting ${usersToCreate.length} User records...`);
  await prisma.user.createMany({ data: usersToCreate });

  console.log(`Inserting ${parentsToCreate.length} Parent records...`);
  await prisma.parent.createMany({ data: parentsToCreate });

  console.log(`Inserting ${studentsToCreate.length} Student records...`);
  await prisma.student.createMany({ data: studentsToCreate });

  // --- 5. ATTENDANCE (Rahul Mohanty & dynamic students) ---
  console.log('Seeding attendance logs (last 30 school days)...');
  const attendanceToCreate = [];
  const today = new Date();
  
  // Find database IDs for generated student profile items
  const createdStudents = await prisma.student.findMany({ select: { id: true, class: true } });

  // Generate 30 days of attendance logs
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const formattedDate = new Date(date.setHours(0, 0, 0, 0));

    for (const stud of createdStudents) {
      // Only seed attendance for all students in Class 10, and a random subset of other classes to save db space
      if (stud.class !== '10' && Math.random() > 0.15) continue;

      let status = 'PRESENT';
      const rand = Math.random();
      if (rand > 0.95) status = 'ABSENT';
      else if (rand > 0.90) status = 'LATE';

      const teacher = teachersMap[stud.class] || defaultTeacherProfile;

      attendanceToCreate.push({
        id: randomUUID(),
        studentId: stud.id,
        date: formattedDate,
        status: status,
        markedById: teacher.id
      });
    }
  }

  console.log(`Inserting ${attendanceToCreate.length} Attendance records...`);
  await prisma.attendance.createMany({ data: attendanceToCreate });

  // --- 6. GRADES (Rahul Mohanty & random students) ---
  console.log('Seeding academic grades...');
  const gradesToCreate = [];
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

  // Seed grades for Rahul Mohanty (defaultStudentProfileId) and some others
  for (const stud of createdStudents) {
    if (stud.id !== defaultStudentProfileId && Math.random() > 0.2) continue; // Only seed grades for subset

    for (const subject of subjects) {
      for (const exam of exams) {
        const theory = exam.base + (Math.random() * exam.factor) - (exam.factor / 2);
        const roundedTheory = Math.min(exam.max, Math.max(0, Math.round(theory * 10) / 10));
        const total = roundedTheory;
        const percentage = (total / exam.max) * 100;

        gradesToCreate.push({
          id: randomUUID(),
          studentId: stud.id,
          subject: subject,
          examType: exam.type,
          theoryMarks: roundedTheory,
          practicalMarks: 0,
          totalMarks: total,
          maxMarks: exam.max,
          grade: calculateGradeString(percentage),
          term: exam.term,
          academicYear: '2025-2026'
        });
      }
    }
  }

  console.log(`Inserting ${gradesToCreate.length} Grade records...`);
  await prisma.grade.createMany({ data: gradesToCreate });


  // --- 8. LIBRARY BOOKS ---
  console.log('Seeding library books...');
  const books = [
    { title: 'Higher Algebra', author: 'Hall & Knight', isbn: '9788120304322', category: 'Mathematics', copies: 10, loc: 'Shelf M-3' },
    { title: 'Fundamentals of Physics', author: 'Resnick & Halliday', isbn: '9781118230718', category: 'Science', copies: 8, loc: 'Shelf S-8' },
    { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', category: 'Science', copies: 6, loc: 'Shelf S-11' },
    { title: 'Julius Caesar', author: 'William Shakespeare', isbn: '9780743482783', category: 'Literature', copies: 12, loc: 'Shelf L-1' },
    { title: 'Computer Science with Python', author: 'Sumita Arora', isbn: '9789389635032', category: 'Computer Science', copies: 20, loc: 'Shelf CS-2' },
    { title: 'India Since Independence', author: 'Bipan Chandra', isbn: '9780143102229', category: 'Social Studies', copies: 8, loc: 'Shelf SS-5' }
  ];

  for (const b of books) {
    const createdBook = await prisma.book.create({
      data: {
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        category: b.category,
        totalCopies: b.copies,
        availableCopies: b.copies - 1,
        location: b.loc
      }
    });

    // Create an active issue for default student
    if (b.category === 'Science' && b.title.includes('Physics')) {
      const issue = new Date();
      issue.setDate(today.getDate() - 10);
      const due = new Date();
      due.setDate(today.getDate() + 4);

      await prisma.bookIssue.create({
        data: {
          bookId: createdBook.id,
          studentId: defaultStudentProfileId,
          issueDate: issue,
          dueDate: due,
          status: 'ISSUED'
        }
      });
    }
  }

  // --- 9. ANNOUNCEMENTS ---
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

  // --- 10. LEAVE REQUESTS ---
  console.log('Seeding leave requests...');
  await prisma.leaveRequest.create({
    data: {
      userId: defaultStudentUserId,
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
      userId: defaultTeacherProfile.userId, // use default teacher user
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
