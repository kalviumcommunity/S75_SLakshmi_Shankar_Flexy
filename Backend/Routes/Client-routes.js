const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const auth = require("../middleware/auth");
const Client = require("../Schema/Client-schema");
const Expert = require("../Schema/Expert-schema");

const JWT_SECRET = process.env.JWT_SECRET;

// Input validation helper
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

/* -------------------- TEST ROUTES (DEV ONLY) -------------------- */
// Only enable in development environment
if (process.env.NODE_ENV !== 'production') {
  router.post("/test-addClients", async (req, res) => {
    try {
      const { name, phone, password } = req.body;

      if (!name || !phone || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const client = await Client.create({ name, phone, password: hashedPassword });

      res.status(201).json({
        _id: client._id,
        name: client.name,
        phone: client.phone
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  router.get("/test-getClients", async (req, res) => {
    try {
      const clients = await Client.find().select("-password");
      res.json(clients);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

/* -------------------- AUTH ROUTES -------------------- */

// CLIENT SIGNUP
router.post("/client-signup", async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // Validation
    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({ message: "Invalid phone number format", success: false });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters", success: false });
    }

    // Check existing user
    const existing = await Client.findOne({ phone });
    if (existing) {
      return res.status(409).json({ message: "Client already exists", success: false });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const client = await Client.create({ name, phone, password: hashedPassword });

    // Generate token
    const token = jwt.sign(
      { id: client.phone, role: "client", _id: client._id },
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
      message: "Client registered successfully", 
      success: true,
      clientId: client._id,
      clientPhone: client.phone
    });
  } catch (err) {
    console.error("Client signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message, success: false });
  }
});

// CLIENT LOGIN
router.post("/client-login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validation
    if (!phone || !password) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    // Find client
    const client = await Client.findOne({ phone });
    if (!client) {
      return res.status(404).json({ message: "Client not found", success: false });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    // Generate token
    const token = jwt.sign(
      { id: client.phone, role: "client", _id: client._id },
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
      success: true,
      clientId: client._id,
      clientPhone: client.phone
    });
  } catch (err) {
    console.error("Client login error:", err);
    res.status(500).json({ message: "Server error", error: err.message, success: false });
  }
});

// GET LOGGED-IN CLIENT
router.get("/client/me", auth, async (req, res) => {
  try {
    // Find by phone (which is stored as 'id' in JWT)
    const client = await Client.findOne({ phone: req.user.id }).select("-password");
    
    if (!client) {
      return res.status(404).json({ message: "Client not found", success: false });
    }
    
    res.json({ client, success: true });
  } catch (err) {
    console.error("Get client error:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
});

/* -------------------- EXPERT SEARCH -------------------- */

// BY LOCATION
router.post("/get-by-location", auth, async (req, res) => {
  try {
    const { location } = req.body;

    if (!location || location.trim() === '') {
      return res.status(400).json({ message: "Location is required", success: false });
    }

    const experts = await Expert.find({
      location: { $regex: new RegExp(`^${location.trim()}$`, "i") }
    }).select("-password");

    if (!experts.length) {
      return res.status(404).json({ message: "No experts found in this location", success: false });
    }

    res.status(200).json({ data: experts, success: true });
  } catch (err) {
    console.error("Location search error:", err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// BY PROFESSION
router.post("/get-by-profession", auth, async (req, res) => {
  try {
    const { profession } = req.body;

    if (!profession || profession.trim() === '') {
      return res.status(400).json({ message: "Profession is required", success: false });
    }

    const experts = await Expert.find({
      profession: { $regex: new RegExp(`^${profession.trim()}$`, "i") }
    }).select("-password");

    if (!experts.length) {
      return res.status(404).json({ message: "No experts found for this profession", success: false });
    }

    res.status(200).json({ data: experts, success: true });
  } catch (err) {
    console.error("Profession search error:", err);
    res.status(500).json({ error: err.message, success: false });
  }
});

// BY ID
router.get("/expert/:id", auth, async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id).select("-password");
    
    if (!expert) {
      return res.status(404).json({ message: "Expert not found", success: false });
    }
    
    res.status(200).json({ expert, success: true });
  } catch (err) {
    console.error("Get expert error:", err);
    res.status(500).json({ error: err.message, success: false });
  }
});

/* -------------------- UPDATE CLIENT -------------------- */

// Client can update ONLY their own account
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

    // Find by phone (stored as 'id' in JWT)
    const client = await Client.findOne({ phone: req.user.id });
    
    if (!client) {
      return res.status(404).json({ message: "Client not found", success: false });
    }

    const updated = await Client.findByIdAndUpdate(
      client._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Account updated successfully",
      user: updated,
      success: true
    });
  } catch (err) {
    console.error("Update account error:", err);
    res.status(500).json({ error: err.message, success: false });
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
