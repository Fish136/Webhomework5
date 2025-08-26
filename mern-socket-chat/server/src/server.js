import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import messageRoutes from "./routes/messages.js";
import { attachSocket } from "./socket.js";

const app = express();

// Security
app.use(helmet());

// Allowed origins (dev + prod)
const allowedOrigins = (process.env.CLIENT_ORIGIN?.split(",") || []).map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));


// Body limit
app.use(express.json({ limit: "1mb" }));

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api/", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Create HTTP + WS server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : "*",
    credentials: true,
  },
});

attachSocket(io);

// Start server
const port = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI).then(() => {
  httpServer.listen(port, () =>
    console.log(`🚀 Server listening on http://localhost:${port}`)
  );
});
