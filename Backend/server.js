const express = require("express");
const mongoose = require("mongoose");
const path = require('path');
const cors = require("cors");
const cookieParser = require('cookie-parser');
require("dotenv").config();

const userRoute = require("./Routes/Client-routes");
const expertRoute = require("./Routes/Expert-routes");
const chatRoute = require("./Routes/Chat-routes");
const bookingRoute = require("./Routes/Booking-routes");

const app = express();
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

const allowedOrigins = [
  "http://localhost:5174",
  "https://flexyfrontend.netlify.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api", userRoute);
app.use("/api", expertRoute);
app.use("/api", chatRoute);
app.use("/api", bookingRoute);

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
