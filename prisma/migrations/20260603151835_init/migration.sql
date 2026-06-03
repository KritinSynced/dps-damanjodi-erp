-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "rollNo" INTEGER NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "cardQrCode" TEXT,
    "libraryCardNo" TEXT,
    "parentId" TEXT NOT NULL,
    "transportRouteId" TEXT,
    "transportStop" TEXT,
    CONSTRAINT "Student_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Student_transportRouteId_fkey" FOREIGN KEY ("transportRouteId") REFERENCES "BusRoute" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "occupation" TEXT,
    "relation" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "address" TEXT NOT NULL,
    CONSTRAINT "Parent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "joinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" TEXT NOT NULL,
    "classTeacherOfClass" TEXT,
    "classTeacherOfSection" TEXT,
    CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "subject" TEXT,
    "markedById" TEXT,
    CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "examType" TEXT NOT NULL,
    "theoryMarks" REAL NOT NULL,
    "practicalMarks" REAL NOT NULL DEFAULT 0.0,
    "totalMarks" REAL NOT NULL,
    "maxMarks" REAL NOT NULL,
    "grade" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Grade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeePayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "paidDate" DATETIME,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "receiptNo" TEXT,
    CONSTRAINT "FeePayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "totalCopies" INTEGER NOT NULL,
    "availableCopies" INTEGER NOT NULL,
    "location" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BookIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "issueDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME NOT NULL,
    "returnDate" DATETIME,
    "status" TEXT NOT NULL,
    "fineAmount" REAL NOT NULL DEFAULT 0.0,
    CONSTRAINT "BookIssue_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookIssue_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusRoute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeName" TEXT NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT NOT NULL,
    "stops" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comments" TEXT,
    "appliedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeaveRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admissionNo_key" ON "Student"("admissionNo");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_userId_key" ON "Parent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "Teacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_employeeId_key" ON "Teacher"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_date_subject_key" ON "Attendance"("studentId", "date", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "FeePayment_receiptNo_key" ON "FeePayment"("receiptNo");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
