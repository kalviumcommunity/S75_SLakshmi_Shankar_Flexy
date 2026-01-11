const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Validate critical environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Import routes
const userRoute = require("./Routes/Client-routes");
const expertRoute = require("./Routes/Expert-routes");
const bookingRoute = require("./Routes/Booking-routes");
const chatRoute = require("./Routes/Chat-routes");

const app = express();
const server = http.createServer(app);

// ✅ ADD THIS LINE - Trust proxy for Render
app.set('trust proxy', 1);

// Allowed origins configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      "https://flexyfrontend.netlify.app",
      "https://flexy-life.netlify.app",
      "http://localhost:5173",
      process.env.FRONTEND_URL
    ].filter(Boolean)
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000"
    ];

console.log(`🌍 Allowed origins:`, allowedOrigins);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

/* ================= SECURITY MIDDLEWARE ================= */

// Helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Sanitize MongoDB queries
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

/* ================= BASIC MIDDLEWARE ================= */

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= ROUTES ================= */

// Apply auth rate limiter to login/signup routes
app.use("/api/client-login", authLimiter);
app.use("/api/client-signup", authLimiter);
app.use("/api/expert-login", authLimiter);
app.use("/api/expert-sign-up", authLimiter);

// Route handlers - ORDER MATTERS!
app.use("/api", expertRoute);   // ✅ More specific routes first (/expert/me)
app.use("/api", userRoute);     // ✅ Less specific routes second (/expert/:id)
app.use("/api", bookingRoute);
app.use("/api", chatRoute);

/* ================= SOCKET.IO ================= */

// Store active connections
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Join room
  socket.on("join-room", (roomId) => {
    if (!roomId) {
      socket.emit("error", { message: "Room ID is required" });
      return;
    }
    socket.join(roomId);
    activeUsers.set(socket.id, roomId);
    console.log(`👤 User ${socket.id} joined room: ${roomId}`);
    
    // Notify room members
    socket.to(roomId).emit("user-joined", { socketId: socket.id });
  });

  // Send message
  socket.on("send-message", ({ roomId, message, sender }) => {
    if (!roomId || !message || !sender) {
      socket.emit("error", { message: "Missing required fields" });
      return;
    }

    const messageData = {
      message,
      sender,
      time: new Date().toISOString(),
      socketId: socket.id
    };

    io.to(roomId).emit("receive-message", messageData);
    console.log(`💬 Message sent in room ${roomId} by ${sender}`);
  });

  // Handle typing indicator
  socket.on("typing", ({ roomId, sender }) => {
    if (roomId && sender) {
      socket.to(roomId).emit("user-typing", { sender });
    }
  });

  socket.on("stop-typing", ({ roomId, sender }) => {
    if (roomId && sender) {
      socket.to(roomId).emit("user-stop-typing", { sender });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    const roomId = activeUsers.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit("user-left", { socketId: socket.id });
      activeUsers.delete(socket.id);
    }
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

/* ================= DATABASE ================= */

const mongooseOptions = {
  // useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+
};

mongoose
  .connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => {
    console.log("✅ MongoDB Connected");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  };
  res.status(200).json(healthCheck);
});

/* ================= ERROR HANDLING ================= */

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/* ================= SERVER START ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💤 Server closed');
    mongoose.connection.close(false, () => {
      console.log('💤 MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = { app, server, io };