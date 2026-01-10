const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const userRoute = require("./Routes/Client-routes");
const expertRoute = require("./Routes/Expert-routes");
const bookingRoute = require("./Routes/Booking-routes");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://flexyfrontend.netlify.app",
  "https://flexy-life.netlify.app"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", userRoute);
app.use("/api", expertRoute);
app.use("/api", bookingRoute);

/* ================= SOCKET.IO ================= */

io.on("connection", (socket) => {
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send-message", ({ roomId, message, sender }) => {
    io.to(roomId).emit("receive-message", {
      message,
      sender,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on("disconnect", () => {});
});

/* ================= DATABASE ================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
