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
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5000"], // allow next.js dev and capacitor
  credentials: true
}));
app.use(express.json());

// Basic health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "DPS Damanjodi ERP API Server is running." });
});

// Attach Routes
app.use("/api/auth", authRoutes);
app.use("/api/portal", portalRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express Error Handler:", err);
  res.status(500).json({ success: false, error: err.message || "An internal server error occurred." });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
