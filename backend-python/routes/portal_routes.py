import uuid
import random
from datetime import datetime
import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from database import get_db
from auth_middleware import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

# --- 1. STUDENT PORTAL DATA ---
@router.get("/student")
def get_student_dashboard(studentId: str, db = Depends(get_db)):
    if not studentId:
        raise HTTPException(status_code=400, detail="Missing Student ID")
        
    student_query = text('SELECT * FROM "Student" WHERE id = :student_id')
    student_row = db.execute(student_query, {"student_id": studentId}).mappings().first()
    if not student_row:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    student = dict(student_row)
    
    # Fetch user details
    user_query = text('SELECT * FROM "User" WHERE id = :user_id')
    user_row = db.execute(user_query, {"user_id": student["userId"]}).mappings().first()
    student["user"] = dict(user_row) if user_row else None
    
    # Fetch parent details
    parent_query = text('SELECT * FROM "Parent" WHERE id = :parent_id')
    parent_row = db.execute(parent_query, {"parent_id": student["parentId"]}).mappings().first()
    if parent_row:
        parent = dict(parent_row)
        parent_user_row = db.execute(user_query, {"user_id": parent["userId"]}).mappings().first()
        parent["user"] = dict(parent_user_row) if parent_user_row else None
        student["parent"] = parent
    else:
        student["parent"] = None
        
    # Fetch attendance
    attendance_query = text('SELECT * FROM "Attendance" WHERE "studentId" = :student_id ORDER BY date DESC')
    attendance_rows = db.execute(attendance_query, {"student_id": studentId}).mappings().all()
    student["attendance"] = [dict(r) for r in attendance_rows]
    
    # Fetch grades
    grades_query = text('SELECT * FROM "Grade" WHERE "studentId" = :student_id ORDER BY "createdAt" DESC')
    grades_rows = db.execute(grades_query, {"student_id": studentId}).mappings().all()
    student["grades"] = [dict(r) for r in grades_rows]
    
    # Fetch bookIssues
    book_issues_query = text('SELECT * FROM "BookIssue" WHERE "studentId" = :student_id ORDER BY "issueDate" DESC')
    book_issue_rows = db.execute(book_issues_query, {"student_id": studentId}).mappings().all()
    
    book_issues = []
    for bi_row in book_issue_rows:
        bi = dict(bi_row)
        book_query = text('SELECT * FROM "Book" WHERE id = :book_id')
        book_row = db.execute(book_query, {"book_id": bi["bookId"]}).mappings().first()
        bi["book"] = dict(book_row) if book_row else None
        book_issues.append(bi)
    student["bookIssues"] = book_issues
    
    # Fetch announcements
    announcements_query = text('''
        SELECT * FROM "Announcement"
        WHERE "targetRole" = 'ALL' OR "targetRole" = 'STUDENT'
        ORDER BY date DESC LIMIT 8
    ''')
    announcements_rows = db.execute(announcements_query).mappings().all()
    announcements = [dict(r) for r in announcements_rows]
    
    return {"success": True, "student": student, "announcements": announcements}

# --- 2. PARENT PORTAL DATA ---
@router.get("/parent")
def get_parent_dashboard(parentId: str, db = Depends(get_db)):
    if not parentId:
        raise HTTPException(status_code=400, detail="Missing Parent ID")
        
    parent_query = text('SELECT * FROM "Parent" WHERE id = :parent_id')
    parent_row = db.execute(parent_query, {"parent_id": parentId}).mappings().first()
    if not parent_row:
        raise HTTPException(status_code=404, detail="Parent profile not found")
        
    parent = dict(parent_row)
    
    # Fetch user details
    user_query = text('SELECT * FROM "User" WHERE id = :user_id')
    user_row = db.execute(user_query, {"user_id": parent["userId"]}).mappings().first()
    parent["user"] = dict(user_row) if user_row else None
    
    # Fetch students
    students_query = text('SELECT * FROM "Student" WHERE "parentId" = :parent_id')
    students_rows = db.execute(students_query, {"parent_id": parentId}).mappings().all()
    
    students = []
    for s_row in students_rows:
        student = dict(s_row)
        
        # User details
        s_user_row = db.execute(user_query, {"user_id": student["userId"]}).mappings().first()
        student["user"] = dict(s_user_row) if s_user_row else None
        
        # Attendance
        attendance_query = text('SELECT * FROM "Attendance" WHERE "studentId" = :student_id ORDER BY date DESC')
        attendance_rows = db.execute(attendance_query, {"student_id": student["id"]}).mappings().all()
        student["attendance"] = [dict(r) for r in attendance_rows]
        
        # Grades
        grades_query = text('SELECT * FROM "Grade" WHERE "studentId" = :student_id ORDER BY "createdAt" DESC')
        grades_rows = db.execute(grades_query, {"student_id": student["id"]}).mappings().all()
        student["grades"] = [dict(r) for r in grades_rows]
        
        # Book issues
        book_issues_query = text('SELECT * FROM "BookIssue" WHERE "studentId" = :student_id')
        book_issue_rows = db.execute(book_issues_query, {"student_id": student["id"]}).mappings().all()
        
        book_issues = []
        for bi_row in book_issue_rows:
            bi = dict(bi_row)
            book_query = text('SELECT * FROM "Book" WHERE id = :book_id')
            book_row = db.execute(book_query, {"book_id": bi["bookId"]}).mappings().first()
            bi["book"] = dict(book_row) if book_row else None
            book_issues.append(bi)
        student["bookIssues"] = book_issues
        
        students.append(student)
        
    parent["students"] = students
    
    # Fetch announcements
    announcements_query = text('''
        SELECT * FROM "Announcement"
        WHERE "targetRole" = 'ALL' OR "targetRole" = 'PARENT'
        ORDER BY date DESC LIMIT 8
    ''')
    announcements_rows = db.execute(announcements_query).mappings().all()
    announcements = [dict(r) for r in announcements_rows]
    
    return {"success": True, "parent": parent, "announcements": announcements}

# --- 3. TEACHER PORTAL DATA ---
@router.get("/teacher")
def get_teacher_dashboard(teacherId: str, db = Depends(get_db)):
    if not teacherId:
        raise HTTPException(status_code=400, detail="Missing Teacher ID")
        
    teacher_query = text('SELECT * FROM "Teacher" WHERE id = :teacher_id')
    teacher_row = db.execute(teacher_query, {"teacher_id": teacherId}).mappings().first()
    if not teacher_row:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
        
    teacher = dict(teacher_row)
    
    # Fetch user details
    user_query = text('SELECT * FROM "User" WHERE id = :user_id')
    user_row = db.execute(user_query, {"user_id": teacher["userId"]}).mappings().first()
    teacher["user"] = dict(user_row) if user_row else None
    
    students = []
    pendingLeaves = []
    
    class_name = teacher.get("classTeacherOfClass")
    section_name = teacher.get("classTeacherOfSection")
    
    if class_name and section_name:
        # Fetch students
        students_query = text('SELECT * FROM "Student" WHERE class = :class_name AND section = :section_name ORDER BY "rollNo" ASC')
        students_rows = db.execute(students_query, {"class_name": class_name, "section_name": section_name}).mappings().all()
        
        for s_row in students_rows:
            student = dict(s_row)
            s_user_row = db.execute(user_query, {"user_id": student["userId"]}).mappings().first()
            student["user"] = dict(s_user_row) if s_user_row else None
            students.append(student)
            
        # Fetch pending leaves
        if students:
            student_user_ids = [s["userId"] for s in students]
            leaves_query = text('SELECT * FROM "LeaveRequest" WHERE "userId" = ANY(:user_ids) AND status = \'PENDING\' ORDER BY "appliedDate" DESC')
            leaves_rows = db.execute(leaves_query, {"user_ids": student_user_ids}).mappings().all()
            
            for l_row in leaves_rows:
                leave = dict(l_row)
                l_user_row = db.execute(user_query, {"user_id": leave["userId"]}).mappings().first()
                leave["user"] = dict(l_user_row) if l_user_row else None
                pendingLeaves.append(leave)
                
    # Fetch announcements
    announcements_query = text('''
        SELECT * FROM "Announcement"
        WHERE "targetRole" = 'ALL' OR "targetRole" = 'TEACHER'
        ORDER BY date DESC LIMIT 6
    ''')
    announcements_rows = db.execute(announcements_query).mappings().all()
    announcements = [dict(r) for r in announcements_rows]
    
    return {
        "success": True,
        "teacher": teacher,
        "students": students,
        "pendingLeaves": pendingLeaves,
        "announcements": announcements
    }

# --- 4. ADMIN PORTAL DATA ---
@router.get("/admin")
def get_admin_dashboard(db = Depends(get_db)):
    student_count_query = text('SELECT COUNT(*) FROM "Student"')
    student_count = db.execute(student_count_query).scalar() or 0
    
    teacher_count_query = text('SELECT COUNT(*) FROM "Teacher"')
    teacher_count = db.execute(teacher_count_query).scalar() or 0
    
    book_count_query = text('SELECT COUNT(*) FROM "Book"')
    book_count = db.execute(book_count_query).scalar() or 0
    
    # Fetch all students
    students_query = text('SELECT * FROM "Student" ORDER BY class ASC')
    students_rows = db.execute(students_query).mappings().all()
    
    user_query = text('SELECT * FROM "User" WHERE id = :user_id')
    parent_query = text('SELECT * FROM "Parent" WHERE id = :parent_id')
    
    students = []
    for s_row in students_rows:
        student = dict(s_row)
        
        # User details
        s_user_row = db.execute(user_query, {"user_id": student["userId"]}).mappings().first()
        student["user"] = dict(s_user_row) if s_user_row else None
        
        # Parent details
        p_row = db.execute(parent_query, {"parent_id": student["parentId"]}).mappings().first()
        if p_row:
            parent = dict(p_row)
            p_user_row = db.execute(user_query, {"user_id": parent["userId"]}).mappings().first()
            parent["user"] = dict(p_user_row) if p_user_row else None
            student["parent"] = parent
        else:
            student["parent"] = None
            
        students.append(student)
        
    # Fetch all teachers
    teachers_query = text('SELECT * FROM "Teacher" ORDER BY "employeeId" ASC')
    teachers_rows = db.execute(teachers_query).mappings().all()
    
    teachers = []
    for t_row in teachers_rows:
        teacher = dict(t_row)
        t_user_row = db.execute(user_query, {"user_id": teacher["userId"]}).mappings().first()
        teacher["user"] = dict(t_user_row) if t_user_row else None
        teachers.append(teacher)
        
    # Fetch all books
    books_query = text('SELECT * FROM "Book" ORDER BY title ASC')
    books_rows = db.execute(books_query).mappings().all()
    books = [dict(b) for b in books_rows]
    
    # Audit Logs (match Node.js mock data)
    auditLogs = [
        { "id": 1, "action": "Admin session initialized", "user": "Dr. Sujata Mohapatra", "time": "Just now" },
        { "id": 2, "action": "Prisma client db connection sync", "user": "System Engine", "time": "5 mins ago" },
        { "id": 3, "action": "New leave request filed", "user": "Rahul Mohanty (Student)", "time": "10 mins ago" },
        { "id": 4, "action": "Weekly homework sheet published", "user": "Sunita Sharma (Teacher)", "time": "1 hour ago" },
        { "id": 5, "action": "Fee payment receipts verified", "user": "Ramesh Mohanty (Parent)", "time": "2 hours ago" },
    ]
    
    return {
        "success": True,
        "metrics": {
            "studentCount": student_count,
            "teacherCount": teacher_count,
            "bookCount": book_count
        },
        "students": students,
        "teachers": teachers,
        "books": books,
        "auditLogs": auditLogs
    }

# --- 5. LEAVES ROUTING ---
# POST: Submit leave request
@router.post("/leaves")
def create_leave_request(payload: dict, db = Depends(get_db)):
    userId = payload.get("userId")
    role = payload.get("role")
    startDate = payload.get("startDate")
    endDate = payload.get("endDate")
    reason = payload.get("reason")
    
    if not userId or not role or not startDate or not endDate or not reason:
        raise HTTPException(status_code=400, detail="Please enter all required fields")
        
    try:
        leave_id = str(uuid.uuid4())
        insert_query = text('''
            INSERT INTO "LeaveRequest" (id, "userId", role, "startDate", "endDate", reason, status, "appliedDate")
            VALUES (:id, :userId, :role, :startDate, :endDate, :reason, :status, NOW())
        ''')
        
        start_dt = datetime.fromisoformat(startDate.replace("Z", "+00:00"))
        end_dt = datetime.fromisoformat(endDate.replace("Z", "+00:00"))
        
        db.execute(insert_query, {
            "id": leave_id,
            "userId": userId,
            "role": role,
            "startDate": start_dt,
            "endDate": end_dt,
            "reason": reason,
            "status": "PENDING"
        })
        db.commit()
        
        new_leave_row = db.execute(text('SELECT * FROM "LeaveRequest" WHERE id = :id'), {"id": leave_id}).mappings().first()
        return {"success": True, "leaveRequest": dict(new_leave_row)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e) or "Server error filing leave request")

# GET: Fetch leave requests for a user
@router.get("/leaves")
def get_leaves(userId: str, db = Depends(get_db)):
    if not userId:
        raise HTTPException(status_code=400, detail="Missing User ID")
        
    leaves_query = text('SELECT * FROM "LeaveRequest" WHERE "userId" = :userId ORDER BY "appliedDate" DESC')
    leaves_rows = db.execute(leaves_query, {"userId": userId}).mappings().all()
    return {"success": True, "leaves": [dict(r) for r in leaves_rows]}

# POST: Update leave status (Approve/Reject)
@router.post("/leaves/update")
def update_leave_status(payload: dict, db = Depends(get_db)):
    leaveId = payload.get("leaveId")
    status = payload.get("status")
    comments = payload.get("comments")
    
    if not leaveId or not status:
        raise HTTPException(status_code=400, detail="Missing Leave Request ID or Status")
        
    try:
        update_query = text('UPDATE "LeaveRequest" SET status = :status, comments = :comments WHERE id = :leaveId')
        db.execute(update_query, {
            "status": status,
            "comments": comments or None,
            "leaveId": leaveId
        })
        db.commit()
        
        updated_row = db.execute(text('SELECT * FROM "LeaveRequest" WHERE id = :id'), {"id": leaveId}).mappings().first()
        return {"success": True, "leaveRequest": dict(updated_row) if updated_row else None}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e) or "Server error processing leave decision")

# --- 7. TEACHER OPERATIONS ---
# POST: Submit Student Attendance
@router.post("/teacher/attendance")
def save_attendance(payload: dict, db = Depends(get_db)):
    date = payload.get("date")
    records = payload.get("records")
    teacherId = payload.get("teacherId")
    
    if not date or not records or not isinstance(records, list) or not teacherId:
        raise HTTPException(status_code=400, detail="Missing required attendance parameters")
        
    try:
        parsed_date = datetime.fromisoformat(date.replace("Z", "+00:00")).replace(hour=0, minute=0, second=0, microsecond=0)
        
        for rec in records:
            student_id = rec.get("studentId")
            status = rec.get("status")
            subject = rec.get("subject", "")
            
            # Check if exists
            check_query = text('SELECT id FROM "Attendance" WHERE "studentId" = :student_id AND date = :date AND subject = :subject')
            existing = db.execute(check_query, {
                "student_id": student_id,
                "date": parsed_date,
                "subject": subject
            }).scalar()
            
            if existing:
                update_query = text('UPDATE "Attendance" SET status = :status, "markedById" = :teacher_id WHERE id = :id')
                db.execute(update_query, {
                    "status": status,
                    "teacher_id": teacherId,
                    "id": existing
                })
            else:
                insert_query = text('INSERT INTO "Attendance" (id, "studentId", date, status, subject, "markedById") VALUES (:id, :student_id, :date, :status, :subject, :teacher_id)')
                db.execute(insert_query, {
                    "id": str(uuid.uuid4()),
                    "student_id": student_id,
                    "date": parsed_date,
                    "status": status,
                    "subject": subject,
                    "teacher_id": teacherId
                })
                
        db.commit()
        return {"success": True, "message": f"Successfully marked attendance for {len(records)} students."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e) or "Server error saving class attendance")

# POST: Submit Student Grade
@router.post("/teacher/grades")
def save_grade(payload: dict, db = Depends(get_db)):
    studentId = payload.get("studentId")
    subject = payload.get("subject")
    examType = payload.get("examType")
    theoryMarks = payload.get("theoryMarks")
    practicalMarks = payload.get("practicalMarks", 0)
    maxMarks = payload.get("maxMarks")
    term = payload.get("term", "Term 1")
    academicYear = payload.get("academicYear", "2025-2026")
    
    if not studentId or not subject or not examType or theoryMarks is None or not maxMarks:
        raise HTTPException(status_code=400, detail="Missing required grade card parameters")
        
    def calculate_grade_string(percentage: float) -> str:
        if percentage >= 91: return "A1"
        if percentage >= 81: return "A2"
        if percentage >= 71: return "B1"
        if percentage >= 61: return "B2"
        if percentage >= 51: return "C1"
        if percentage >= 41: return "C2"
        return "D"
        
    try:
        t_marks = float(theoryMarks)
        p_marks = float(practicalMarks)
        total = t_marks + p_marks
        max_m = float(maxMarks)
        percentage = (total / max_m) * 100
        grade_letter = calculate_grade_string(percentage)
        
        grade_id = str(uuid.uuid4())
        insert_grade = text('''
            INSERT INTO "Grade" (id, "studentId", subject, "examType", "theoryMarks", "practicalMarks", "totalMarks", "maxMarks", grade, term, "academicYear", "createdAt")
            VALUES (:id, :studentId, :subject, :examType, :theoryMarks, :practicalMarks, :totalMarks, :maxMarks, :grade, :term, :academicYear, NOW())
        ''')
        db.execute(insert_grade, {
            "id": grade_id,
            "studentId": studentId,
            "subject": subject,
            "examType": examType,
            "theoryMarks": t_marks,
            "practicalMarks": p_marks,
            "totalMarks": total,
            "maxMarks": max_m,
            "grade": grade_letter,
            "term": term,
            "academicYear": academicYear
        })
        db.commit()
        
        new_grade_row = db.execute(text('SELECT * FROM "Grade" WHERE id = :id'), {"id": grade_id}).mappings().first()
        return {"success": True, "gradeCard": dict(new_grade_row)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e) or "Server error uploading grade records")

# --- 8. ADMIN OPERATIONS ---
# POST: Create Announcement
@router.post("/admin/announcements")
def create_announcement(payload: dict, db = Depends(get_db)):
    title = payload.get("title")
    content = payload.get("content")
    targetRole = payload.get("targetRole")
    category = payload.get("category")
    authorId = payload.get("authorId")
    
    if not title or not content or not targetRole or not category or not authorId:
        raise HTTPException(status_code=400, detail="Please enter all required announcement fields")
        
    try:
        announcement_id = str(uuid.uuid4())
        insert_query = text('''
            INSERT INTO "Announcement" (id, title, content, "targetRole", category, date, "authorId")
            VALUES (:id, :title, :content, :targetRole, :category, NOW(), :authorId)
        ''')
        db.execute(insert_query, {
            "id": announcement_id,
            "title": title,
            "content": content,
            "targetRole": targetRole,
            "category": category,
            "authorId": authorId
        })
        db.commit()
        
        new_announcement_row = db.execute(text('SELECT * FROM "Announcement" WHERE id = :id'), {"id": announcement_id}).mappings().first()
        return {"success": True, "announcement": dict(new_announcement_row)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e) or "Server error publishing announcement notice")

# POST: Create Student
@router.post("/admin/students")
def create_student(payload: dict, db = Depends(get_db)):
    name = payload.get("name")
    email = payload.get("email")
    className = payload.get("className")
    section = payload.get("section")
    rollNo = payload.get("rollNo")
    parentName = payload.get("parentName")
    parentEmail = payload.get("parentEmail")
    phone = payload.get("phone")
    address = payload.get("address")
    
    if not name or not email or not className or not section or not rollNo or not parentName or not parentEmail or not phone:
        raise HTTPException(status_code=400, detail="Please enter all required student and parent fields")
        
    admissionNo = "DPS-2026-" + str(random.randint(1000, 9999))
    
    check_email_query = text('SELECT id FROM "User" WHERE email = :email')
    existing_user = db.execute(check_email_query, {"email": email}).scalar()
    if existing_user:
         raise HTTPException(status_code=400, detail="Email already registered")
         
    try:
        # Fetch or create parent
        parent_query = text('SELECT p.* FROM "Parent" p JOIN "User" u ON p."userId" = u.id WHERE u.email = :email')
        parent = db.execute(parent_query, {"email": parentEmail}).mappings().first()
        
        if not parent:
            parent_user_id = str(uuid.uuid4())
            p_username = parentEmail.split("@")[0]
            parent_password_hash = bcrypt.hashpw(f"{p_username}123".encode("utf-8"), bcrypt.gensalt(10)).decode("utf-8")
            insert_p_user = text('''
                INSERT INTO "User" (id, email, "passwordHash", role, name, avatar, "createdAt", "updatedAt")
                VALUES (:id, :email, :passwordHash, 'PARENT', :name, :avatar, NOW(), NOW())
            ''')
            db.execute(insert_p_user, {
                "id": parent_user_id,
                "email": parentEmail,
                "passwordHash": parent_password_hash,
                "name": parentName,
                "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={parentName}"
            })
            
            parent_id = str(uuid.uuid4())
            insert_parent = text('''
                INSERT INTO "Parent" (id, "userId", phone, relation, address)
                VALUES (:id, :userId, :phone, 'FATHER', :address)
            ''')
            db.execute(insert_parent, {
                "id": parent_id,
                "userId": parent_user_id,
                "phone": phone,
                "address": address or "Nalco Township, Damanjodi"
            })
        else:
            parent_id = parent["id"]
            
        # Create student user
        student_user_id = str(uuid.uuid4())
        s_username = email.split("@")[0]
        student_password_hash = bcrypt.hashpw(f"{s_username}123".encode("utf-8"), bcrypt.gensalt(10)).decode("utf-8")
        insert_s_user = text('''
            INSERT INTO "User" (id, email, "passwordHash", role, name, avatar, "createdAt", "updatedAt")
            VALUES (:id, :email, :passwordHash, 'STUDENT', :name, :avatar, NOW(), NOW())
        ''')
        db.execute(insert_s_user, {
            "id": student_user_id,
            "email": email,
            "passwordHash": student_password_hash,
            "name": name,
            "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={name}"
        })
        
        # Create student profile
        student_id = str(uuid.uuid4())
        insert_student = text('''
            INSERT INTO "Student" (id, "userId", "admissionNo", class, section, "rollNo", "dateOfBirth", gender, phone, address, "parentId")
            VALUES (:id, :userId, :admissionNo, :className, :section, :rollNo, :dateOfBirth, :gender, :phone, :address, :parentId)
        ''')
        db.execute(insert_student, {
            "id": student_id,
            "userId": student_user_id,
            "admissionNo": admissionNo,
            "className": className,
            "section": section,
            "rollNo": int(rollNo),
            "dateOfBirth": datetime.strptime("2012-05-15", "%Y-%m-%d"),
            "gender": "Male",
            "phone": phone,
            "address": address or "Nalco Township, Damanjodi",
            "parentId": parent_id
        })
        
        db.commit()
        
        new_student_row = db.execute(text('SELECT * FROM "Student" WHERE id = :id'), {"id": student_id}).mappings().first()
        return {"success": True, "student": dict(new_student_row)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e) or "Server error registering student profile")

# POST: Create Teacher
@router.post("/admin/teachers")
def create_teacher(payload: dict, db = Depends(get_db)):
    name = payload.get("name")
    email = payload.get("email")
    employeeId = payload.get("employeeId")
    department = payload.get("department")
    qualification = payload.get("qualification")
    phone = payload.get("phone")
    classTeacherOfClass = payload.get("classTeacherOfClass")
    classTeacherOfSection = payload.get("classTeacherOfSection")
    
    if not name or not email or not employeeId or not department or not qualification or not phone:
        raise HTTPException(status_code=400, detail="Please enter all required teacher fields")
        
    check_email_query = text('SELECT id FROM "User" WHERE email = :email')
    existing_user = db.execute(check_email_query, {"email": email}).scalar()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    check_emp_query = text('SELECT id FROM "Teacher" WHERE "employeeId" = :employeeId')
    existing_emp = db.execute(check_emp_query, {"employeeId": employeeId}).scalar()
    if existing_emp:
        raise HTTPException(status_code=400, detail="Employee ID already registered")
        
    try:
        user_id = str(uuid.uuid4())
        t_username = email.split("@")[0]
        teacher_password_hash = bcrypt.hashpw(f"{t_username}123".encode("utf-8"), bcrypt.gensalt(10)).decode("utf-8")
        insert_user = text('''
            INSERT INTO "User" (id, email, "passwordHash", role, name, avatar, "createdAt", "updatedAt")
            VALUES (:id, :email, :passwordHash, 'TEACHER', :name, :avatar, NOW(), NOW())
        ''')
        db.execute(insert_user, {
            "id": user_id,
            "email": email,
            "passwordHash": teacher_password_hash,
            "name": name,
            "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={name}"
        })
        
        teacher_id = str(uuid.uuid4())
        insert_teacher = text('''
            INSERT INTO "Teacher" (id, "userId", "employeeId", department, qualification, phone, "classTeacherOfClass", "classTeacherOfSection", "joinDate")
            VALUES (:id, :userId, :employeeId, :department, :qualification, :phone, :classTeacherOfClass, :classTeacherOfSection, NOW())
        ''')
        db.execute(insert_teacher, {
            "id": teacher_id,
            "userId": user_id,
            "employeeId": employeeId,
            "department": department,
            "qualification": qualification,
            "phone": phone,
            "classTeacherOfClass": classTeacherOfClass or None,
            "classTeacherOfSection": classTeacherOfSection or None
        })
        
        db.commit()
        
        new_teacher_row = db.execute(text('SELECT * FROM "Teacher" WHERE id = :id'), {"id": teacher_id}).mappings().first()
        return {"success": True, "teacher": dict(new_teacher_row)}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e) or "Server error registering teacher profile")
