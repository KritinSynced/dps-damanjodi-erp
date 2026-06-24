import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { sendOtpEmail } from "../lib/email";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dps_damanjodi_erp_secret_key_2026_xyz";

// Helper to mask email: e.g. j***e@domain.com
function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const local = parts[0];
  const domain = parts[1];
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

// 1. POST: verify-email
router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Your account is not registered in the system. Contact your administrator."
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "Your account has been deactivated. Contact your administrator."
      });
    }

    return res.json({
      success: true,
      maskedEmail: maskEmail(user.email)
    });
  } catch (error: any) {
    console.error("Verify Email API Error:", error);
    return res.status(500).json({ success: false, error: "Server error checking email registration" });
  }
});

// 2. POST: login (password verification, sends OTP)
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "Your account is deactivated. Contact your administrator."
      });
    }

    // Rate limit check: max 5 failed attempts in 15 minutes lockout
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const failedAttemptsCount = await prisma.loginAttempt.count({
      where: {
        email: normalizedEmail,
        success: false,
        createdAt: { gte: fifteenMinsAgo }
      }
    });

    if (failedAttemptsCount >= 5) {
      return res.status(429).json({
        success: false,
        error: "Too many failed attempts. Account locked. Try again after 15 minutes."
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Log failed attempt
      await prisma.loginAttempt.create({
        data: {
          email: normalizedEmail,
          success: false,
          userId: user.id
        }
      });
      return res.status(401).json({ success: false, error: "Invalid email or password" });
    }

    // Log successful password check
    await prisma.loginAttempt.create({
      data: {
        email: normalizedEmail,
        success: true,
        userId: user.id
      }
    });

    // Generate 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    const otpHash = await bcrypt.hash(otp, 10);

    // Save to OtpRecord
    await prisma.otpRecord.create({
      data: {
        userId: user.id,
        otpHash,
        expiresAt: otpExpires,
        used: false
      }
    });

    // Send OTP email via SMTP / Gmail relay
    await sendOtpEmail(normalizedEmail, otp);

    return res.json({
      success: true,
      message: "Security verification code sent to your registered email address.",
      email: normalizedEmail
    });
  } catch (error: any) {
    console.error("Login API Error:", error);
    return res.status(500).json({ success: false, error: "Server error verifying password credentials" });
  }
});

// 3. POST: verify-otp (OTP validation, issues JWT cookie)
router.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: "Email and verification code are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "User not found or deactivated" });
    }

    // Find the latest active verification code for this user
    const latestOtp = await prisma.otpRecord.findFirst({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gte: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!latestOtp) {
      return res.status(400).json({
        success: false,
        error: "Verification code has expired or is invalid. Please request a new one."
      });
    }

    const isMatch = await bcrypt.compare(otp.trim(), latestOtp.otpHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid verification code" });
    }

    // Mark OTP as used
    await prisma.otpRecord.update({
      where: { id: latestOtp.id },
      data: { used: true }
    });

    // Build session user object and encode profile keys
    const sessionUser: any = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
    };

    // Include Student profile details if student
    if (user.role === "STUDENT") {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id }
      });
      if (studentProfile) {
        sessionUser.studentProfileId = studentProfile.id;
        sessionUser.class = studentProfile.class;
        sessionUser.section = studentProfile.section;
      }
    }

    // Include Teacher profile details if teacher
    if (user.role === "TEACHER") {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: user.id }
      });
      if (teacherProfile) {
        sessionUser.teacherProfileId = teacherProfile.id;
        sessionUser.department = teacherProfile.department;
      }
    }

    // Sign JWT
    const token = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "7d" });

    // Set cookie on response
    res.cookie("dps_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Log login action in audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "USER_SIGN_IN",
        target: `User logged in: ${user.email} (Role: ${user.role})`
      }
    });

    return res.json({
      success: true,
      token,
      user: sessionUser
    });
  } catch (error: any) {
    console.error("Verify OTP API Error:", error);
    return res.status(500).json({ success: false, error: "Server error during verification code validation" });
  }
});

// 4. POST: logout
router.post("/logout", async (req: Request, res: Response) => {
  res.clearCookie("dps_token");
  return res.json({
    success: true,
    message: "Logged out successfully"
  });
});

// 5. GET: me (auth check)
router.get("/me", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }
    return res.json({
      success: true,
      user: authReq.user
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Server error loading session details" });
  }
});

// 6. POST: switch-role
router.post("/switch-role", authenticateToken, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id;
    const { newRole } = req.body;

    if (!userId || !newRole) {
      return res.status(400).json({ success: false, error: "Missing new role parameters" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "User not found or inactive" });
    }

    // Determine available roles for the user dynamically
    const availableRoles = [user.role];
    if (user.role === "PRINCIPAL") {
      const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId } });
      if (teacherProfile) {
        availableRoles.push("TEACHER");
      }
    }
    
    // Check if the requested role is available to switch to
    if (!availableRoles.includes(newRole)) {
      return res.status(403).json({ success: false, error: "Unauthorized role transition request" });
    }

    // Generate new JWT with switched role
    const sessionUser: any = {
      id: user.id,
      email: user.email,
      role: newRole,
      name: user.name,
      avatar: user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`,
      availableRoles
    };

    if (newRole === "STUDENT") {
      const studentProfile = await prisma.studentProfile.findUnique({ where: { userId } });
      if (studentProfile) {
        sessionUser.studentProfileId = studentProfile.id;
        sessionUser.class = studentProfile.class;
        sessionUser.section = studentProfile.section;
      }
    }

    if (newRole === "TEACHER") {
      const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId } });
      if (teacherProfile) {
        sessionUser.teacherProfileId = teacherProfile.id;
        sessionUser.department = teacherProfile.department;
      }
    }

    const token = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("dps_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.json({
      success: true,
      token,
      user: sessionUser
    });
  } catch (error: any) {
    console.error("Switch Role Error:", error);
    return res.status(500).json({ success: false, error: "Server error during role transition" });
  }
});

// 7. POST: request-password-change (sends OTP to authorize password change)
router.post("/request-password-change", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "Account not found or inactive" });
    }

    // Generate OTP for password change authorization
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const otpHash = await bcrypt.hash(otp, 10);

    await prisma.otpRecord.create({
      data: { userId: user.id, otpHash, expiresAt: otpExpires, used: false }
    });

    await sendOtpEmail(normalizedEmail, otp);
    console.log(`[PASSWORD CHANGE OTP] Sent to ${normalizedEmail}: ${otp}`);

    return res.json({
      success: true,
      message: "Verification code sent to your email."
    });
  } catch (error: any) {
    console.error("Request Password Change Error:", error);
    return res.status(500).json({ success: false, error: "Server error sending verification code" });
  }
});

// 8. POST: change-password (verify OTP + save new bcrypt password hash to DB)
router.post("/change-password", async (req: Request, res: Response) => {
  try {
    const { email, newPassword, otp } = req.body;

    if (!email || !newPassword || !otp) {
      return res.status(400).json({ success: false, error: "Email, new password, and OTP are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "New password must be at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, error: "Account not found or inactive" });
    }

    // Verify OTP
    const latestOtp = await prisma.otpRecord.findFirst({
      where: { userId: user.id, used: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: "desc" }
    });

    if (!latestOtp) {
      return res.status(400).json({ success: false, error: "Verification code expired. Please request a new one." });
    }

    const isOtpMatch = await bcrypt.compare(otp.trim(), latestOtp.otpHash);
    if (!isOtpMatch) {
      return res.status(400).json({ success: false, error: "Invalid verification code" });
    }

    // Mark OTP used
    await prisma.otpRecord.update({ where: { id: latestOtp.id }, data: { used: true } });

    // Hash and permanently save new password to database
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });

    // Audit log
    await prisma.auditLog.create({
      data: { actorId: user.id, action: "PASSWORD_CHANGED", target: `Password changed for: ${user.email}` }
    });

    console.log(`[PASSWORD CHANGED] Successfully updated for ${normalizedEmail}`);

    return res.json({
      success: true,
      message: "Password changed successfully. You can now log in with your new password."
    });
  } catch (error: any) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ success: false, error: "Server error updating password" });
  }
});

export default router;
