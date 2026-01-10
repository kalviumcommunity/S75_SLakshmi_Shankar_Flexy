const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Expert = require("../Schema/Expert-schema");
const auth = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET;

// Input validation helpers
const validateContact = (contact) => {
  const contactRegex = /^[0-9]{10,15}$/;
  return contactRegex.test(contact.toString());
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

/* -------------------- EXPERT SIGNUP -------------------- */
router.post("/expert-sign-up", async (req, res) => {
  try {
    const { name, contact, profession, exp, location, password } = req.body;

    // Validation
    if (!name || !contact || !profession || !exp || !location || !password) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    if (!validateContact(contact)) {
      return res.status(400).json({ message: "Invalid contact number format", success: false });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters", success: false });
    }

    if (isNaN(exp) || exp < 0) {
      return res.status(400).json({ message: "Experience must be a valid number", success: false });
    }

    // Check existing expert
    const existing = await Expert.findOne({ contact });
    if (existing) {
      return res.status(409).json({ message: "Expert already exists", success: false });
    }

    // Create expert
    const hashedPassword = await bcrypt.hash(password, 12);

    const expert = await Expert.create({
      name,
      contact,
      profession,
      exp,
      location,
      password: hashedPassword
    });

    // Generate token
    const token = jwt.sign(
      { id: expert.contact, role: "expert", _id: expert._id },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 12 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined
    });

    res.status(201).json({
      message: "Expert registered successfully",
      token,
      expertId: expert._id,
      expertContact: expert.contact,
      success: true
    });
  } catch (err) {
    console.error("Expert signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message, success: false });
  }
});

/* -------------------- EXPERT LOGIN -------------------- */
router.post("/expert-login", async (req, res) => {
  try {
    const { contact, password } = req.body;

    // Validation
    if (!contact || !password) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    // Find expert
    const expert = await Expert.findOne({ contact });
    if (!expert) {
      return res.status(404).json({ message: "Expert not found", success: false });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, expert.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    // Generate token
    const token = jwt.sign(
      { id: expert.contact, role: "expert", _id: expert._id },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 12 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined
    });

    res.status(200).json({
      message: "Login successful",
      token,
      expertId: expert._id,
      expertContact: expert.contact,
      success: true
    });
  } catch (err) {
    console.error("Expert login error:", err);
    res.status(500).json({ message: "Server error", error: err.message, success: false });
  }
});

// GET LOGGED-IN EXPERT
router.get("/expert/me", auth, async (req, res) => {
  try {
    // Find by contact (which is stored as 'id' in JWT)
    const expert = await Expert.findOne({ contact: req.user.id }).select("-password");
    
    if (!expert) {
      return res.status(404).json({ message: "Expert not found", success: false });
    }
    
    res.json({ expert, success: true });
  } catch (err) {
    console.error("Get expert error:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
});

/* -------------------- GET ALL EXPERTS (PUBLIC) -------------------- */
router.get("/all-experts", async (req, res) => {
  try {
    const experts = await Expert.find().select("-password");

    if (!experts.length) {
      return res.status(404).json({ message: "No experts found", success: false });
    }

    res.status(200).json({ experts, success: true });
  } catch (err) {
    console.error("Get all experts error:", err);
    res.status(500).json({ message: "Server error", error: err.message, success: false });
  }
});

/* -------------------- UPDATE EXPERT (SELF ONLY) -------------------- */
router.put("/update-account", auth, async (req, res) => {
  try {
    // Don't allow password update through this route
    const { password, ...updateData } = req.body;

    if (password) {
      return res.status(400).json({ 
        message: "Password cannot be updated through this endpoint", 
        success: false 
      });
    }

    // Find by contact (stored as 'id' in JWT)
    const expert = await Expert.findOne({ contact: req.user.id });
    
    if (!expert) {
      return res.status(404).json({ message: "Expert not found", success: false });
    }

    const updated = await Expert.findByIdAndUpdate(
      expert._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Account updated successfully",
      expert: updated,
      success: true
    });
  } catch (err) {
    console.error("Update expert error:", err);
    res.status(500).json({ message: "Server error", error: err.message, success: false });
  }
});

/* -------------------- LOGOUT -------------------- */
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined
  });
  
  res.status(200).json({ message: "Logged out successfully", success: true });
});

// AUTH CHECK
router.get("/auth-check", auth, (req, res) => {
  res.json({
    message: "Authenticated",
    user: req.user,
    success: true
  });
});

module.exports = router;
