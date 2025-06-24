const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");
require("dotenv").config();

const userRoute = require("./Routes/Client-routes");
const expertRoute = require("./Routes/Expert-routes");

const app = express();
// const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173" 
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

app.use("/api", userRoute);
app.use("/api", expertRoute);


// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST"],
//     credentials: true,
//   }
// });


// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("send_message", (data) => {
//     console.log("Message received:", data);
//     socket.broadcast.emit("receive_message", data);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });
