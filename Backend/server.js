const express = require("express");
const mongoose = require("mongoose");
const path = require('path');
const cors = require("cors");
const cookieParser = require('cookie-parser');
require("dotenv").config();

const userRoute = require("./Routes/Client-routes");
const expertRoute = require("./Routes/Expert-routes");

const app = express();
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));

const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://flexyfrontend.netlify.app"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());

app.use("/api", userRoute);
app.use("/api", expertRoute);

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
