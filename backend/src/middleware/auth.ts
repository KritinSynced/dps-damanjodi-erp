import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dps_damanjodi_erp_secret_key_2026_xyz";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "STUDENT" | "TEACHER" | "ADMIN" | "CLERK" | "PEON" | "SECURITY_GUARD" | "PRINCIPAL";
    name: string;
    avatar?: string;
    studentId?: string;
    teacherId?: string;
  };
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts[0].trim();
    const value = parts.slice(1).join("=").trim();
    cookies[name] = value;
  });
  return cookies;
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Check Authorization header first
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1]; // Format: Bearer TOKEN

  // Fallback to cookies
  if (!token) {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies["dps_token"];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: "Invalid or expired token" });
    }

    (req as AuthenticatedRequest).user = decoded as AuthenticatedRequest["user"];
    next();
  });
}

