const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Expert = require('../Schema/Expert-schema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require("../middleware/auth")
require('dotenv').config();

const jwt = require('jsonwebtoken');
const JWT = process.env.JWT_SECRET;


// Expert Login
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

    const token = jwt.sign({ id: expert.contact }, JWT, {
      expiresIn: "12h"
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 12 * 60 * 60 * 1000
    });

    res.cookie('name', expert.name, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 12 * 60 * 60 * 1000
    });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Sign-up route
router.post("/expert-sign-up", async (req, res) => {
  try {
    const { name, contact, profession, exp, location, password } = req.body;

    if (!name || !contact || !profession || !exp || !location || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if expert already exists
    const existingExpert = await Expert.findOne({ contact });
    if (existingExpert) {
      return res.status(409).json({ message: "Expert already exists with this contact" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const expert = new Expert({
      name,
      contact,
      profession,
      exp,
      location,
      password: hashedPassword
    });

    await expert.save();

    const token = jwt.sign({ id: expert.contact }, JWT, {
      expiresIn: "12h"
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 12 * 60 * 60 * 1000
    });

    res.status(201).json({ message: "Expert registered successfully", expertId: expert._id });
  } catch (err) {
    console.error("Error in expert-sign-up:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// Get all experts (should be protected)
router.get('/all-experts', auth, async (req, res) => {

  try {
    const allUsers = await Expert.find();

    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const users = allUsers.map(user => ({
      _id: user._id,
      name: user.name,
      contact: user.contact,
      profession: user.profession,
      exp: user.exp,
      location: user.location
    }));

    res.status(200).json({ message: "Data found", users });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: err.message
    });
  }
});


// Update

router.put("/update-account/:id", auth, async(req, res) => {
    try{
        const userId = req.params.id;

        const newData = req.body;

        if(!userId){
            return res.status(401).json({
                message: "All fields are required"
            })
        }

        await Expert.findByIdAndUpdate(userId, newData, {new: true});
        return res.status(200).json({
            message: "Updated the account"
        })
    }
    catch(err){
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        })
    }
});

module.exports = router;
