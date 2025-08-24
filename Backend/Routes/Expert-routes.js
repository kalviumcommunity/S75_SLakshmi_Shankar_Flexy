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

router.post("/expert-sign-up", async (req, res) => {
  try {
    const { name, contact, profession, exp, location, password, license } = req.body;

    if (!name || !contact || !profession || !exp || !location || !password || !license) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Convert base64 → Buffer
    const licenseBuffer = Buffer.from(license, "base64");

    const expert = new Expert({
      name,
      contact,
      profession,
      exp,
      location,
      password,
      license: licenseBuffer,
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
      return res.status(404).json({
        mess: "No users found"
      });
    }

    // Convert buffer → base64 string
    const usersWithImages = allUsers.map(user => {
      let licenseBase64 = null;

      if (user.license) {
        licenseBase64 = `data:image/png;base64,${user.license.toString("base64")}`;
        // 🔹 If you stored different image types, you may want to store mimetype in schema
      }

      return {
        _id: user._id,
        name: user.name,
        contact: user.contact,
        profession: user.profession,
        exp: user.exp,
        location: user.location,
        license: licenseBase64 || null   // now frontend can directly use in <img />
      };
    });

    res.status(200).json({
      mess: "Data found",
      users: usersWithImages
    });
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
