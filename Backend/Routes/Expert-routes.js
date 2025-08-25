const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Expert = require('../Schema/Exprert-schema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require("../middleware/auth")
require('dotenv').config();

const jwt = require('jsonwebtoken');
const JWT = process.env.JWT_SECRET;


// Sign-up


// Sign-up route
router.post("/expert-sign-up", async (req, res) => {
  try {
    const { name, contact, profession, exp, location, password } = req.body;

    if (!name || !contact || !profession || !exp || !location || !password) {
      return res.status(400).json({ message: "All fields are required" });
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

    res.status(201).json({ message: "Expert registered successfully", expertId: expert._id });
  } catch (err) {
    console.error("Error in expert-sign-up:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Get all experts

router.get('/all-experts', async (req, res) => {
  try {
    const allUsers = await Expert.find();

    if (!allUsers || allUsers.length === 0) {
      return res.status(404).json({ mess: "No users found" });
    }

    const users = allUsers.map(user => ({
      _id: user._id,
      name: user.name,
      contact: user.contact,
      profession: user.profession,
      exp: user.exp,
      location: user.location
    }));

    res.status(200).json({ mess: "Data found", users });
  } catch (err) {
    res.status(500).json({
      mess: "Internal server error",
      Error: err.message
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
            Error: err.message
        })
    }
});

module.exports = router;
