import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dps_damanjodi_erp_secret_key_2026_xyz";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const ADMIN_REGISTRATION_KEY = "dps_admin_2026";

const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper to generate session data for a user
async function getSessionUser(user: any) {
  const sessionUser: any = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    avatar: user.avatar,
    username: user.username,
  };

  if (user.role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
    });
    if (student) {
      sessionUser.studentId = student.id;
      sessionUser.class = student.class;
      sessionUser.section = student.section;
      sessionUser.parentId = student.parentId;
    }
  } else if (user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId: user.id },
    });
    if (teacher) {
      sessionUser.teacherId = teacher.id;
    }
  } else if (user.role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { userId: user.id },
    });
    if (parent) {
      sessionUser.parentId = parent.id;
    }
  }

  return sessionUser;
}

// 1. Password Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please enter email and password" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    // Attempt bcrypt check first, fallback to plain text for mock seeded users
    let isMatch = false;
    if (user.passwordHash) {
      try {
        isMatch = await bcrypt.compare(password, user.passwordHash);
      } catch (err) {
        // Stored password was not a valid bcrypt hash, try plain text comparison
        isMatch = user.passwordHash === password;
      }
      // If comparison threw no error but returned false, try plain text check too just in case
      if (!isMatch) {
        isMatch = user.passwordHash === password;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    const sessionUser = await getSessionUser(user);
    const token = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ success: true, token, user: sessionUser });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return res.status(500).json({ success: false, error: "Server error during login" });
  }
});

// 2. Google OAuth Token Verification
router.post("/google", async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, error: "Google credentials missing" });
    }

    // Verify token with Google
    let payload;
    try {
      const ticket = await oAuth2Client.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.error("Google token verification failed:", err);
      return res.status(401).json({ success: false, error: "Google verification failed" });
    }

    if (!payload || !payload.email) {
      return res.status(401).json({ success: false, error: "Invalid token payload" });
    }

    const email = payload.email;
    const googleId = payload.sub;
    const name = payload.name || "Google User";
    const avatar = payload.picture || "";

    // Check if user exists by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email }
        ]
      }
    });

    if (user) {
      // If user exists by email but googleId is not linked, link it now
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatar: user.avatar || avatar },
        });
      }

      const sessionUser = await getSessionUser(user);
      const token = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "7d" });

      return res.json({
        success: true,
        requiresRoleSelection: false,
        token,
        user: sessionUser
      });
    } else {
      // User does not exist, return flag to trigger role selection on frontend
      return res.json({
        success: true,
        requiresRoleSelection: true,
        email,
        name,
        avatar,
        googleId
      });
    }
  } catch (error: any) {
    console.error("Google Auth API Error:", error);
    return res.status(500).json({ success: false, error: "Server error during Google auth" });
  }
});

// 3. Register Google User with Selected Role
router.post("/register-role", async (req: Request, res: Response) => {
  try {
    const { role, googleId, email, name, avatar, additionalData } = req.body;

    if (!role || !googleId || !email || !name) {
      return res.status(400).json({ success: false, error: "Missing required registration details" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] }
    });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already registered" });
    }

    let username: string | null = null;
    if (role === "STUDENT") {
      const admissionNo = additionalData.admissionNo || "";
      username = admissionNo.slice(-4);
    } else if (role === "TEACHER") {
      username = additionalData.employeeId || "";
    } else if (role === "PARENT") {
      const studentAdmissionNo = additionalData.studentAdmissionNo || "";
      username = `Parent-${studentAdmissionNo.slice(-4)}`;
    } else if (role === "ADMIN") {
      username = additionalData.adminUsername || "";
    }

    // Begin registration transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // 1. Create base user
      const user = await tx.user.create({
        data: {
          email,
          name,
          avatar,
          googleId,
          role,
          username,
        }
      });

      // 2. Create role specific record
      if (role === "STUDENT") {
        const { admissionNo, className, section, rollNo, dateOfBirth, gender, phone, address, parentEmail } = additionalData;

        // Try to find the parent by email
        let parent = await tx.parent.findFirst({
          where: { user: { email: parentEmail } }
        });

        // If parent does not exist, create a stub parent user + profile
        if (!parent) {
          const parentUser = await tx.user.create({
            data: {
              email: parentEmail,
              name: `Parent of ${name}`,
              role: "PARENT",
            }
          });
          parent = await tx.parent.create({
            data: {
              userId: parentUser.id,
              phone: phone || "",
              address: address || "",
              relation: "GUARDIAN",
            }
          });
        }

        await tx.student.create({
          data: {
            userId: user.id,
            admissionNo,
            class: className,
            section,
            rollNo: parseInt(rollNo) || 1,
            dateOfBirth: new Date(dateOfBirth),
            gender,
            phone,
            address,
            parentId: parent.id,
          }
        });
      } else if (role === "PARENT") {
        const { occupation, relation, phone, address, studentAdmissionNo } = additionalData;

        const parent = await tx.parent.create({
          data: {
            userId: user.id,
            occupation,
            relation,
            phone,
            address,
          }
        });

        // Link student if admission number is provided
        if (studentAdmissionNo) {
          const student = await tx.student.findUnique({
            where: { admissionNo: studentAdmissionNo }
          });
          if (student) {
            await tx.student.update({
              where: { id: student.id },
              data: { parentId: parent.id }
            });
          }
        }
      } else if (role === "TEACHER") {
        const { employeeId, department, qualification, phone } = additionalData;

        await tx.teacher.create({
          data: {
            userId: user.id,
            employeeId,
            department,
            qualification,
            phone,
          }
        });
      } else if (role === "ADMIN") {
        const { adminKey } = additionalData;
        if (adminKey !== ADMIN_REGISTRATION_KEY) {
          throw new Error("Invalid admin registration security key");
        }
      }

      return user;
    });

    const sessionUser = await getSessionUser(newUser);
    const token = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ success: true, token, user: sessionUser });
  } catch (error: any) {
    console.error("Register Role API Error:", error.message || error);
    return res.status(500).json({ success: false, error: error.message || "Server error during registration" });
  }
});

// 4. Register Email/Password User
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, additionalData } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: "Missing required registration details" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already registered" });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    let username: string | null = null;
    if (role === "STUDENT") {
      const admissionNo = additionalData.admissionNo || "";
      username = admissionNo.slice(-4);
    } else if (role === "TEACHER") {
      username = additionalData.employeeId || "";
    } else if (role === "PARENT") {
      const studentAdmissionNo = additionalData.studentAdmissionNo || "";
      username = `Parent-${studentAdmissionNo.slice(-4)}`;
    } else if (role === "ADMIN") {
      username = additionalData.adminUsername || "";
    }

    // Begin registration transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // 1. Create base user
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role,
          username,
        }
      });

      // 2. Create role specific record
      if (role === "STUDENT") {
        const { admissionNo, className, section, rollNo, dateOfBirth, gender, phone, address, parentEmail } = additionalData;

        // Try to find the parent by email
        let parent = await tx.parent.findFirst({
          where: { user: { email: parentEmail } }
        });

        // If parent does not exist, create a stub parent user + profile
        if (!parent) {
          const parentUser = await tx.user.create({
            data: {
              email: parentEmail,
              name: `Parent of ${name}`,
              passwordHash: await bcrypt.hash("parent123", 10),
              role: "PARENT",
            }
          });
          parent = await tx.parent.create({
            data: {
              userId: parentUser.id,
              phone: phone || "",
              address: address || "",
              relation: "GUARDIAN",
            }
          });
        }

        await tx.student.create({
          data: {
            userId: user.id,
            admissionNo,
            class: className,
            section,
            rollNo: parseInt(rollNo) || 1,
            dateOfBirth: new Date(dateOfBirth),
            gender,
            phone,
            address,
            parentId: parent.id,
          }
        });
      } else if (role === "PARENT") {
        const { occupation, relation, phone, address, studentAdmissionNo } = additionalData;

        const parent = await tx.parent.create({
          data: {
            userId: user.id,
            occupation,
            relation,
            phone,
            address,
          }
        });

        // Link student if admission number is provided
        if (studentAdmissionNo) {
          const student = await tx.student.findUnique({
            where: { admissionNo: studentAdmissionNo }
          });
          if (student) {
            await tx.student.update({
              where: { id: student.id },
              data: { parentId: parent.id }
            });
          }
        }
      } else if (role === "TEACHER") {
        const { employeeId, department, qualification, phone } = additionalData;

        await tx.teacher.create({
          data: {
            userId: user.id,
            employeeId,
            department,
            qualification,
            phone,
          }
        });
      } else if (role === "ADMIN") {
        const { adminKey } = additionalData;
        if (adminKey !== ADMIN_REGISTRATION_KEY) {
          throw new Error("Invalid admin registration security key");
        }
      }

      return user;
    });

    const sessionUser = await getSessionUser(newUser);
    const token = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ success: true, token, user: sessionUser });
  } catch (error: any) {
    console.error("Signup API Error:", error.message || error);
    return res.status(500).json({ success: false, error: error.message || "Server error during signup" });
  }
});

// 5. Clerk Sync & Login
router.post("/clerk-sync", async (req: Request, res: Response) => {
  try {
    const { email, name, avatar } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required for syncing" });
    }

    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Return requiresRoleSelection to register new user profiles via frontend
      return res.json({
        success: true,
        requiresRoleSelection: true,
        email,
        name: name || "New User",
        avatar: avatar || "",
        googleId: `clerk_${Date.now()}`
      });
    }

    if (!user.avatar && avatar) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar }
      });
    }

    const sessionUser = await getSessionUser(user);
    const token = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      success: true,
      requiresRoleSelection: false,
      token,
      user: sessionUser
    });
  } catch (error: any) {
    console.error("Clerk Sync API Error:", error);
    return res.status(500).json({ success: false, error: "Server error during Clerk syncing" });
  }
});

export default router;

