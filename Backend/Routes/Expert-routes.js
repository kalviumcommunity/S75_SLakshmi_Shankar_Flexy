const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Expert = require('../Schema/Exprert-schema');
const auth = require("../middleware/auth")
require('dotenv').config();


// Sign-up
router.post('/expert-sign-up', async (req, res) => {
    try {
        const { name, contact, profession, exp, location, password } = req.body;

        if (!name || !contact || !profession || !exp || !location || !password) {
            return res.status(400).json({ error: 'All fields are required' });
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


        res.status(201).json(expert);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/expert-login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ mess: "All fields are required" });
        }

        const userCheck = await Expert.findOne({ contact: phone });

        if (!userCheck) {
            return res.status(409).json({ mess: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, userCheck.password);
        if (!isMatch) {
            return res.status(401).json({ mess: "Incorrect password" });
        }

        return res.status(200).json({
            mess: "Login successful",
            token: token
        });
    } catch (err) {
        return res.status(500).json({
            mess: "Internal server error",
            error: err.message
        });
    }
});


// Get all experts

router.get('/all-experts', async(req, res) => {
    try{
        const allUsers = await Expert.find();

        if (!allUsers){
            return res.status(404).json({
                mess: "No users found"
            })
        }

        res.status(200).json({
            mess: "Data found",
            users: allUsers
        })
    }
    catch(err){
        res.status(500).json({
            mess: "Internal server error",
            Error: err.message
        })
    }
});

// Update

router.put("/update-account/:id", async(req, res) => {
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
