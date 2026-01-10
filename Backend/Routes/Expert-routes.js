const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Expert = require("../Schema/Expert-schema");
const auth = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET;

/* -------------------- EXPERT SIGNUP -------------------- */
router.post("/expert-sign-up", async (req, res) => {
  try {
    const { name, contact, profession, exp, location, password } = req.body;

    if (!name || !contact || !profession || !exp || !location || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Expert.findOne({ contact });
    if (existing) {
      return res.status(409).json({ message: "Expert already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const expert = await Expert.create({
      name,
      contact,
      profession,
      exp,
      location,
      password: hashedPassword
    });

    const token = jwt.sign(
      { id: expert._id, role: "expert" },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 12 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: "Expert registered successfully",
      expertId: expert._id
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* -------------------- EXPERT LOGIN -------------------- */
router.post("/expert-login", async (req, res) => {
  try {
    const { contact, password } = req.body;

    if (!contact || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const expert = await Expert.findOne({ contact });
    if (!expert) {
      return res.status(404).json({ message: "Expert not found" });
    }

    const isMatch = await bcrypt.compare(password, expert.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: expert._id, role: "expert" },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 12 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login successful",
      expertId: expert._id
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* -------------------- GET ALL EXPERTS (CLIENT ONLY) -------------------- */
router.get("/all-experts", async (req, res) => {
  try {
    const experts = await Expert.find().select("-password");

    if (!experts.length) {
      return res.status(404).json({ message: "No experts found" });
    }

    res.status(200).json({ experts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* -------------------- UPDATE EXPERT (SELF ONLY) -------------------- */
router.put("/update-account", auth, async (req, res) => {
  try {
    const updated = await Expert.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Account updated successfully",
      expert: updated
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* -------------------- LOGOUT -------------------- */
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

router.get("/auth-check", auth, (req, res) => {
  res.json({
    message: "Auth working",
    user: req.user
  });
});


module.exports = router;
