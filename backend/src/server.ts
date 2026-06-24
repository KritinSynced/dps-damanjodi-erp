import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import portalRoutes from "./routes/portal";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = ["http://localhost:3000", "http://localhost:5000"];
const frontendUrl = process.env.FRONTEND_URL;
if (frontendUrl) {
  allowedOrigins.push(frontendUrl);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Basic health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "DPS Damanjodi ERP API Server is running." });
});

// Attach Routes
app.use("/api/auth", authRoutes);
app.use("/api/portal", portalRoutes);
app.use("/api/admin", portalRoutes);
app.use("/api/dashboard", portalRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express Error Handler:", err);
  res.status(500).json({ success: false, error: err.message || "An internal server error occurred." });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
