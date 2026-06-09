import os
import uuid
import random
from datetime import datetime, timedelta
import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from google.oauth2 import id_token
from google.auth.transport import requests

from database import get_db, row_to_dict
from auth_middleware import JWT_SECRET

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") or ""
ADMIN_REGISTRATION_KEY = "dps_admin_2026"

# In-memory stores for Captcha and OTP
temp_captcha_store = {}  # captcha_id -> { "answer": int, "expires_at": datetime }
temp_otp_store = {}      # email -> { "otp": str, "expires_at": datetime, "user": dict }

def is_expired(expires_at: datetime) -> bool:
    return datetime.utcnow() > expires_at


def create_jwt_token(payload: dict) -> str:
    expire = datetime.utcnow() + timedelta(days=7)
    payload_copy = payload.copy()
    payload_copy.update({"exp": expire})
    return jwt.encode(payload_copy, JWT_SECRET, algorithm="HS256")

def get_session_user(db, user: dict) -> dict:
    session_user = {
        "id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "name": user["name"],
        "avatar": user.get("avatar"),
    }
    
    role = user["role"]
    if role == "STUDENT":
        student_query = text('SELECT * FROM "Student" WHERE "userId" = :user_id')
        student = db.execute(student_query, {"user_id": user["id"]}).mappings().first()
        if student:
            session_user["studentId"] = student["id"]
            session_user["class"] = student["class"]
            session_user["section"] = student["section"]
            session_user["parentId"] = student["parentId"]
    elif role == "TEACHER":
        teacher_query = text('SELECT * FROM "Teacher" WHERE "userId" = :user_id')
        teacher = db.execute(teacher_query, {"user_id": user["id"]}).mappings().first()
        if teacher:
            session_user["teacherId"] = teacher["id"]
    elif role == "PARENT":
        parent_query = text('SELECT * FROM "Parent" WHERE "userId" = :user_id')
        parent = db.execute(parent_query, {"user_id": user["id"]}).mappings().first()
        if parent:
            session_user["parentId"] = parent["id"]
            
    return session_user

def verify_captcha_helper(payload: dict):
    captcha_id = payload.get("captchaId")
    captcha_answer = payload.get("captchaAnswer")
    
    if not captcha_id or captcha_answer is None:
        raise HTTPException(status_code=400, detail="Missing Captcha response")
        
    captcha_record = temp_captcha_store.get(captcha_id)
    if not captcha_record or is_expired(captcha_record["expires_at"]):
        if captcha_id in temp_captcha_store:
            del temp_captcha_store[captcha_id]
        raise HTTPException(status_code=400, detail="Captcha expired. Please request a new one.")
        
    try:
        user_answer = int(captcha_answer)
    except ValueError:
        raise HTTPException(status_code=400, detail="Captcha answer must be a number")
        
    if user_answer != captcha_record["answer"]:
        if captcha_id in temp_captcha_store:
            del temp_captcha_store[captcha_id]
        raise HTTPException(status_code=400, detail="Incorrect Captcha answer")
        
    # Clear verified captcha so it cannot be reused
    del temp_captcha_store[captcha_id]

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_otp_email(to_email: str, otp: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not (smtp_host and smtp_port and smtp_user and smtp_password):
        print(f"SMTP credentials not configured. Skipping email dispatch for {to_email}.")
        return False
        
    try:
        msg = MIMEMultipart()
        msg["From"] = smtp_user
        msg["To"] = to_email
        msg["Subject"] = "DPS Damanjodi ERP - Login Verification OTP"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 20px; color: #1e293b;">
            <div style="max-width: 500px; margin: auto; background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #0b7a3b; margin: 0;">DPS Damanjodi Portal</h2>
                    <span style="font-size: 12px; color: #64748b;">Secure Login Verification</span>
                </div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
                <p>Hello,</p>
                <p>You are attempting to log into the DPS Damanjodi ERP Portal. Use the following One-Time Password (OTP) to complete your verification:</p>
                <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 15px; text-align: center; margin: 25px 0;">
                    <span style="font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 5px; color: #0f172a;">{otp}</span>
                </div>
                <p style="font-size: 12px; color: #64748b; margin-top: 30px;">This code is valid for 5 minutes. If you did not request this login, please ignore this email.</p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, "html"))
        
        server = smtplib.SMTP(smtp_host, int(smtp_port))
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())
        server.quit()
        print(f"OTP successfully emailed to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to email OTP to {to_email}: {e}")
        return False

def issue_otp_helper(user: dict) -> dict:
    email = user["email"]
    otp = f"{random.randint(100000, 999999)}"
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    temp_otp_store[email] = {
        "otp": otp,
        "expires_at": expires_at,
        "user": dict(user)
    }
    
    print("\n" + "="*50)
    print(f" SECURITY OTP GENERATED FOR {email} ")
    print(f" OTP: {otp} ")
    print("="*50 + "\n")
    
    # Try sending email OTP
    send_otp_email(email, otp)
    
    return {
        "success": True,
        "otpRequired": True,
        "email": email
    }

@router.get("/captcha")
def get_captcha():
    num1 = random.randint(1, 15)
    num2 = random.randint(1, 15)
    answer = num1 + num2
    captcha_id = str(uuid.uuid4())
    
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    temp_captcha_store[captcha_id] = {
        "answer": answer,
        "expires_at": expires_at
    }
    
    return {
        "success": True,
        "captchaId": captcha_id,
        "question": f"What is {num1} + {num2}?"
    }

@router.post("/login")
def login(payload: dict, db = Depends(get_db)):
    verify_captcha_helper(payload)
    
    email = payload.get("email")
    password = payload.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Please enter email and password")
        
    user_query = text('SELECT * FROM "User" WHERE email = :email OR name = :email')
    user = db.execute(user_query, {"email": email}).mappings().first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    password_hash = user.get("passwordHash")
    is_match = False
    if password_hash:
        try:
            # checkpw expects bytes. Try bcrypt check first.
            is_match = bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
        except Exception:
            is_match = password_hash == password
        
        # Fallback to plain text check for seeded users
        if not is_match:
            is_match = password_hash == password
            
    if not is_match:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    return issue_otp_helper(user)

@router.post("/google")
def google_auth(payload: dict, db = Depends(get_db)):
    verify_captcha_helper(payload)
    
    credential = payload.get("credential")
    if not credential:
        raise HTTPException(status_code=400, detail="Google credentials missing")
        
    try:
        idinfo = id_token.verify_oauth2_token(credential, requests.Request(), GOOGLE_CLIENT_ID)
    except Exception as e:
        print("Google verification failed:", e)
        raise HTTPException(status_code=401, detail="Google verification failed")
        
    if not idinfo or not idinfo.get("email"):
        raise HTTPException(status_code=401, detail="Invalid token payload")
        
    email = idinfo.get("email")
    google_id = idinfo.get("sub")
    name = idinfo.get("name", "Google User")
    avatar = idinfo.get("picture", "")
    
    user_query = text('SELECT * FROM "User" WHERE "googleId" = :google_id OR email = :email')
    user = db.execute(user_query, {"google_id": google_id, "email": email}).mappings().first()
    
    if user:
        # Link googleId if missing
        if not user.get("googleId"):
            update_query = text('UPDATE "User" SET "googleId" = :google_id, avatar = COALESCE(avatar, :avatar), "updatedAt" = NOW() WHERE id = :id')
            db.execute(update_query, {"google_id": google_id, "avatar": avatar, "id": user["id"]})
            db.commit()
            # Refetch user
            user = db.execute(user_query, {"google_id": google_id, "email": email}).mappings().first()
            
        return issue_otp_helper(user)
    else:
        return {
            "success": True,
            "requiresRoleSelection": True,
            "email": email,
            "name": name,
            "avatar": avatar,
            "googleId": google_id
        }

@router.post("/verify-otp")
def verify_otp(payload: dict, db = Depends(get_db)):
    email = payload.get("email")
    otp = payload.get("otp")
    
    if not email or not otp:
        raise HTTPException(status_code=400, detail="Missing email or OTP")
        
    otp_record = temp_otp_store.get(email)
    if not otp_record or is_expired(otp_record["expires_at"]):
        if email in temp_otp_store:
            del temp_otp_store[email]
        raise HTTPException(status_code=400, detail="OTP expired or invalid. Please login again.")
        
    if otp_record["otp"] != otp:
        raise HTTPException(status_code=400, detail="Incorrect OTP code")
        
    # Clear verified OTP
    del temp_otp_store[email]
    
    user = otp_record["user"]
    session_user = get_session_user(db, user)
    token = create_jwt_token(session_user)
    
    return {"success": True, "token": token, "user": session_user}


@router.post("/register-role")
def register_role(payload: dict, db = Depends(get_db)):
    role = payload.get("role")
    googleId = payload.get("googleId")
    email = payload.get("email")
    name = payload.get("name")
    avatar = payload.get("avatar", "")
    password = payload.get("password")
    additionalData = payload.get("additionalData", {})
    
    if not role or not googleId or not email or not name:
        raise HTTPException(status_code=400, detail="Missing required registration details")
        
    # Check if exists
    user_query = text('SELECT * FROM "User" WHERE "googleId" = :google_id OR email = :email')
    existing = db.execute(user_query, {"google_id": googleId, "email": email}).mappings().first()
    if existing:
        raise HTTPException(status_code=400, detail="User already registered")
        
    try:
        user_id = str(uuid.uuid4())
        password_hash = ""
        if password:
            password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(10)).decode("utf-8")
        
        # Insert base user
        insert_user = text('INSERT INTO "User" (id, email, "passwordHash", role, name, avatar, "createdAt", "updatedAt", "googleId") '
                           'VALUES (:id, :email, :passwordHash, :role, :name, :avatar, NOW(), NOW(), :googleId)')
        db.execute(insert_user, {
            "id": user_id,
            "email": email,
            "passwordHash": password_hash,
            "role": role,
            "name": name,
            "avatar": avatar,
            "googleId": googleId
        })
        
        # Create role-specific record
        if role == "STUDENT":
            admissionNo = additionalData.get("admissionNo")
            className = additionalData.get("className")
            section = additionalData.get("section")
            rollNo = int(additionalData.get("rollNo") or 1)
            dateOfBirth = additionalData.get("dateOfBirth")
            gender = additionalData.get("gender")
            phone = additionalData.get("phone", "")
            address = additionalData.get("address", "")
            parentEmail = additionalData.get("parentEmail")
            
            # Find parent by email
            parent_query = text('SELECT p.* FROM "Parent" p JOIN "User" u ON p."userId" = u.id WHERE u.email = :email')
            parent = db.execute(parent_query, {"email": parentEmail}).mappings().first()
            
            if not parent:
                parent_user_id = str(uuid.uuid4())
                insert_p_user = text('INSERT INTO "User" (id, email, "passwordHash", role, name, "createdAt", "updatedAt") '
                                     'VALUES (:id, :email, :passwordHash, :role, :name, NOW(), NOW())')
                db.execute(insert_p_user, {
                    "id": parent_user_id,
                    "email": parentEmail,
                    "passwordHash": "",
                    "role": "PARENT",
                    "name": f"Parent of {name}"
                })
                parent_id = str(uuid.uuid4())
                insert_parent = text('INSERT INTO "Parent" (id, "userId", phone, address, relation) '
                                     'VALUES (:id, :userId, :phone, :address, :relation)')
                db.execute(insert_parent, {
                    "id": parent_id,
                    "userId": parent_user_id,
                    "phone": phone,
                    "address": address,
                    "relation": "GUARDIAN"
                })
            else:
                parent_id = parent["id"]
                
            student_id = str(uuid.uuid4())
            insert_student = text('INSERT INTO "Student" (id, "userId", "admissionNo", class, section, "rollNo", "dateOfBirth", gender, phone, address, "parentId") '
                                  'VALUES (:id, :userId, :admissionNo, :className, :section, :rollNo, :dateOfBirth, :gender, :phone, :address, :parentId)')
            db.execute(insert_student, {
                "id": student_id,
                "userId": user_id,
                "admissionNo": admissionNo,
                "className": className,
                "section": section,
                "rollNo": rollNo,
                "dateOfBirth": datetime.strptime(dateOfBirth, "%Y-%m-%d") if isinstance(dateOfBirth, str) else dateOfBirth,
                "gender": gender,
                "phone": phone,
                "address": address,
                "parentId": parent_id
            })
            
        elif role == "PARENT":
            occupation = additionalData.get("occupation", "")
            relation = additionalData.get("relation", "GUARDIAN")
            phone = additionalData.get("phone", "")
            address = additionalData.get("address", "")
            studentAdmissionNo = additionalData.get("studentAdmissionNo")
            
            parent_id = str(uuid.uuid4())
            insert_parent = text('INSERT INTO "Parent" (id, "userId", occupation, relation, phone, address) '
                                 'VALUES (:id, :userId, :occupation, :relation, :phone, :address)')
            db.execute(insert_parent, {
                "id": parent_id,
                "userId": user_id,
                "occupation": occupation,
                "relation": relation,
                "phone": phone,
                "address": address
            })
            
            if studentAdmissionNo:
                student_query = text('SELECT * FROM "Student" WHERE "admissionNo" = :admission_no')
                student = db.execute(student_query, {"admission_no": studentAdmissionNo}).mappings().first()
                if student:
                    update_student = text('UPDATE "Student" SET "parentId" = :parent_id WHERE id = :id')
                    db.execute(update_student, {"parent_id": parent_id, "id": student["id"]})
                    
        elif role == "TEACHER":
            employeeId = additionalData.get("employeeId")
            department = additionalData.get("department")
            qualification = additionalData.get("qualification")
            phone = additionalData.get("phone", "")
            
            teacher_id = str(uuid.uuid4())
            insert_teacher = text('INSERT INTO "Teacher" (id, "userId", "employeeId", department, qualification, phone, "joinDate") '
                                  'VALUES (:id, :userId, :employeeId, :department, :qualification, :phone, NOW())')
            db.execute(insert_teacher, {
                "id": teacher_id,
                "userId": user_id,
                "employeeId": employeeId,
                "department": department,
                "qualification": qualification,
                "phone": phone
            })
            
        elif role == "ADMIN":
            adminKey = additionalData.get("adminKey")
            if adminKey != ADMIN_REGISTRATION_KEY:
                raise HTTPException(status_code=400, detail="Invalid admin registration key")
                
        db.commit()
        
        new_user = db.execute(text('SELECT * FROM "User" WHERE id = :id'), {"id": user_id}).mappings().first()
        session_user = get_session_user(db, new_user)
        token = create_jwt_token(session_user)
        return {"success": True, "token": token, "user": session_user}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e) or "Registration failed")

@router.post("/signup")
def signup(payload: dict, db = Depends(get_db)):
    name = payload.get("name")
    email = payload.get("email")
    password = payload.get("password")
    role = payload.get("role")
    additionalData = payload.get("additionalData", {})
    
    if not name or not email or not password or not role:
        raise HTTPException(status_code=400, detail="Missing required registration details")
        
    # Check if exists
    user_query = text('SELECT * FROM "User" WHERE email = :email')
    existing = db.execute(user_query, {"email": email}).mappings().first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Hash password using bcrypt
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(10)).decode("utf-8")
    
    try:
        user_id = str(uuid.uuid4())
        
        # Insert base user
        insert_user = text('INSERT INTO "User" (id, email, "passwordHash", role, name, "createdAt", "updatedAt") '
                           'VALUES (:id, :email, :passwordHash, :role, :name, NOW(), NOW())')
        db.execute(insert_user, {
            "id": user_id,
            "email": email,
            "passwordHash": password_hash,
            "role": role,
            "name": name
        })
        
        # Create role-specific record
        if role == "STUDENT":
            admissionNo = additionalData.get("admissionNo")
            className = additionalData.get("className")
            section = additionalData.get("section")
            rollNo = int(additionalData.get("rollNo") or 1)
            dateOfBirth = additionalData.get("dateOfBirth")
            gender = additionalData.get("gender")
            phone = additionalData.get("phone", "")
            address = additionalData.get("address", "")
            parentEmail = additionalData.get("parentEmail")
            
            # Find parent by email
            parent_query = text('SELECT p.* FROM "Parent" p JOIN "User" u ON p."userId" = u.id WHERE u.email = :email')
            parent = db.execute(parent_query, {"email": parentEmail}).mappings().first()
            
            if not parent:
                parent_user_id = str(uuid.uuid4())
                insert_p_user = text('INSERT INTO "User" (id, email, "passwordHash", role, name, "createdAt", "updatedAt") '
                                     'VALUES (:id, :email, :passwordHash, :role, :name, NOW(), NOW())')
                db.execute(insert_p_user, {
                    "id": parent_user_id,
                    "email": parentEmail,
                    "passwordHash": bcrypt.hashpw("parent123".encode("utf-8"), bcrypt.gensalt(10)).decode("utf-8"),
                    "role": "PARENT",
                    "name": f"Parent of {name}"
                })
                parent_id = str(uuid.uuid4())
                insert_parent = text('INSERT INTO "Parent" (id, "userId", phone, address, relation) '
                                     'VALUES (:id, :userId, :phone, :address, :relation)')
                db.execute(insert_parent, {
                    "id": parent_id,
                    "userId": parent_user_id,
                    "phone": phone,
                    "address": address,
                    "relation": "GUARDIAN"
                })
            else:
                parent_id = parent["id"]
                
            student_id = str(uuid.uuid4())
            insert_student = text('INSERT INTO "Student" (id, "userId", "admissionNo", class, section, "rollNo", "dateOfBirth", gender, phone, address, "parentId") '
                                  'VALUES (:id, :userId, :admissionNo, :className, :section, :rollNo, :dateOfBirth, :gender, :phone, :address, :parentId)')
            db.execute(insert_student, {
                "id": student_id,
                "userId": user_id,
                "admissionNo": admissionNo,
                "className": className,
                "section": section,
                "rollNo": rollNo,
                "dateOfBirth": datetime.strptime(dateOfBirth, "%Y-%m-%d") if isinstance(dateOfBirth, str) else dateOfBirth,
                "gender": gender,
                "phone": phone,
                "address": address,
                "parentId": parent_id
            })
            
        elif role == "PARENT":
            occupation = additionalData.get("occupation", "")
            relation = additionalData.get("relation", "GUARDIAN")
            phone = additionalData.get("phone", "")
            address = additionalData.get("address", "")
            studentAdmissionNo = additionalData.get("studentAdmissionNo")
            
            parent_id = str(uuid.uuid4())
            insert_parent = text('INSERT INTO "Parent" (id, "userId", occupation, relation, phone, address) '
                                 'VALUES (:id, :userId, :occupation, :relation, :phone, :address)')
            db.execute(insert_parent, {
                "id": parent_id,
                "userId": user_id,
                "occupation": occupation,
                "relation": relation,
                "phone": phone,
                "address": address
            })
            
            if studentAdmissionNo:
                student_query = text('SELECT * FROM "Student" WHERE "admissionNo" = :admission_no')
                student = db.execute(student_query, {"admission_no": studentAdmissionNo}).mappings().first()
                if student:
                    update_student = text('UPDATE "Student" SET "parentId" = :parent_id WHERE id = :id')
                    db.execute(update_student, {"parent_id": parent_id, "id": student["id"]})
                    
        elif role == "TEACHER":
            employeeId = additionalData.get("employeeId")
            department = additionalData.get("department")
            qualification = additionalData.get("qualification")
            phone = additionalData.get("phone", "")
            
            teacher_id = str(uuid.uuid4())
            insert_teacher = text('INSERT INTO "Teacher" (id, "userId", "employeeId", department, qualification, phone, "joinDate") '
                                  'VALUES (:id, :userId, :employeeId, :department, :qualification, :phone, NOW())')
            db.execute(insert_teacher, {
                "id": teacher_id,
                "userId": user_id,
                "employeeId": employeeId,
                "department": department,
                "qualification": qualification,
                "phone": phone
            })
            
        elif role == "ADMIN":
            adminKey = additionalData.get("adminKey")
            if adminKey != ADMIN_REGISTRATION_KEY:
                raise HTTPException(status_code=400, detail="Invalid admin registration key")
                
        db.commit()
        
        new_user = db.execute(text('SELECT * FROM "User" WHERE id = :id'), {"id": user_id}).mappings().first()
        session_user = get_session_user(db, new_user)
        token = create_jwt_token(session_user)
        return {"success": True, "token": token, "user": session_user}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e) or "Registration failed")
