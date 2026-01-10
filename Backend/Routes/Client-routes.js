const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const auth = require("../middleware/auth");
const Client = require("../Schema/Client-schema");
const Expert = require("../Schema/Expert-schema");

const JWT_SECRET = process.env.JWT_SECRET;

/* -------------------- TEST ROUTES (DEV ONLY) -------------------- */
// ❗ DO NOT USE IN PRODUCTION
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

/* -------------------- AUTH ROUTES -------------------- */

// CLIENT SIGNUP
router.post("/client-signup", async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Client.findOne({ phone });
    if (existing) {
      return res.status(409).json({ message: "Client already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await Client.create({ name, phone, password: hashedPassword });

    const token = jwt.sign(
      { id: client._id, role: "client" },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 12 * 60 * 60 * 1000
    });

    res.status(201).json({ message: "Client registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// CLIENT LOGIN
router.post("/client-login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const client = await Client.findOne({ phone });
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: client._id, role: "client" },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 12 * 60 * 60 * 1000
    });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* -------------------- EXPERT SEARCH -------------------- */

// BY LOCATION
router.post("/get-by-location", auth, async (req, res) => {
  try {
    const { location } = req.body;

    const experts = await Expert.find({
      location: { $regex: new RegExp(`^${location}$`, "i") }
    }).select("-password");

    if (!experts.length) {
      return res.status(404).json({ message: "No data found" });
    }

    res.status(200).json({ data: experts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BY PROFESSION
router.post("/get-by-profession", auth, async (req, res) => {
  try {
    const { profession } = req.body;

    const experts = await Expert.find({
      profession: { $regex: new RegExp(`^${profession}$`, "i") }
    }).select("-password");

    if (!experts.length) {
      return res.status(404).json({ message: "No data found" });
    }

    res.status(200).json({ data: experts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BY ID
router.get("/expert/:id", auth, async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id).select("-password");
    if (!expert) {
      return res.status(404).json({ message: "Expert not found" });
    }
    res.status(200).json(expert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------- UPDATE CLIENT -------------------- */

// 🔐 Client can update ONLY their own account
router.put("/update-account", auth, async (req, res) => {
  try {
    const updated = await Client.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Account updated successfully",
      user: updated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------- LOGOUT -------------------- */
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
