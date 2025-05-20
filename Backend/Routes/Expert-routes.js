const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Expert = require('../Schema/Exprert-schema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require("../middleware/auth")
require('dotenv').config();


// Sign-up
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });


router.post('/expert-sign-up', upload.single('license'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'License file is required' });
        }
        const { name, contact, profession, exp, location, password } = req.body;
        const file = req.file;

        const hashedPassword = await bcrypt.hash(password, 10);

        const expert = new Expert({
            name,
            contact,
            licenseFile: {
                filename: file.originalname,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
            },
            profession,
            exp,
            location,
            password: hashedPassword
        });

        await expert.save();

        const payload = { id: expert.contact };
        const token = await jwt.sign(payload, JWT, { expiresIn: '12h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            maxAge: 12 * 60 * 60 * 1000
        });

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
            return res.status(400).json({ message: "All fields are required" });
        }

        const userCheck = await Expert.findOne({ contact: phone });

        if (!userCheck) {
            return res.status(409).json({ message: "User not found" });
        }

        // Password checking
        const isMatch = await bcrypt.compare(password, userCheck.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        };

        const payload  = { id: userCheck.contact};
        const token = jwt.sign(payload, JWT, {expiresIn: '12h'})

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'Lax',
            maxAge: 12 * 60 * 60 * 1000
        });

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

router.get('/all-experts',auth, async(req, res) => {
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
