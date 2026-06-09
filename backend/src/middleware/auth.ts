import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dps_damanjodi_erp_secret_key_2026_xyz";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "STUDENT" | "PARENT" | "TEACHER" | "ADMIN";
    name: string;
    avatar?: string;
    studentId?: string;
    teacherId?: string;
    parentId?: string;
  };
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: Bearer TOKEN

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
