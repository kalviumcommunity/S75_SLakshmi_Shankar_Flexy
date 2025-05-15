const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const Client = require("../Schema/Client-schema");
const bcrypt = require("bcrypt");



// Test Routes
router.post('/test-addClients', async(req, res) => {
    try{
        const { name, phone, password } = req.body;

        if(!name || !phone || !password){
            return res.status(401).json({
                message: "All fields are required"
            })
        }

        const newClient = new Client({ name, phone, password });
        await newClient.save();
        res.status(201).json(newClient);
    } catch(err){
        res.status(400).json({ error: err.message });
    }
})


router.get('/test-getClients', async (req, res) => {
    try {
      const clients = await Client.find();
      res.json(clients);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


                                                            // Main Routes

// Sign-up
router.post('/client-signup',async(req, res)=>{

    const { name, phone, password } = req.body;

    if (!name || !phone || !password){
        return res.status(400).json({
            mess: "All fields are required"
        })
    }

    try{
        const checkUser = await Client.findOne({ phone });
        if (checkUser){
            return res.status(409).json({
                mess: "Client already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newClient = new Client({
            name:name,
            phone:phone,
            password:hashedPassword
        })
        await newClient.save();

        res.status(201).json({
            mess: "Client registered successfully"
        });
    }
    catch(err){
        res.status(500).json({
            mess: "Internal server error",
            error: err.message
        })
    }
});


// Login 
router.post("/client-login", async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ mess: "All fields are required" });
    }

    try {
        const client = await Client.findOne({ phone });

        if (!client) {
            return res.status(404).json({ mess: "Client not found" });
        }

        const isMatch = await bcrypt.compare(password, client.password);
        if (!isMatch) {
            return res.status(401).json({ mess: "Invalid credentials" });
        }

        res.status(200).json({ mess: "Login successful" });
    } catch (err) {
        res.status(500).json({
            mess: "Internal server error",
            error: err.message
        });
    }
});


// Find by location

router.post("/get-by-location", auth, async(req, res) => {
    try{
        const { location } = req.body;

        const allData = await Expert.find({ location: { $regex: new RegExp(`^${location}$`, 'i') }});
        if(allData.length === 0){
            return res.status(404).json({
                message: "No data found"
            })
        }
    
        return res.status(200).json({
            data: allData
        })
    }
    catch(err){
        return res.status(500).json({
            error: err.message
        })
    }
});

// Find by profession

router.post("/get-by-profession", auth, async(req, res) => {
    try{
        const { profession } = req.body;

        const allData = await Expert.find({ profession: { $regex: new RegExp(`^${profession}$`, 'i') }});
        if(allData.length === 0){
            return res.status(404).json({
                message: "No data found"
            })
        }
    
        return res.status(200).json({
            data: allData
        })
    }
    catch(err){
        return res.status(500).json({
            error: err.message
        })
    }
});

// Find by id

router.post("/get-by-id", auth, async(req, res) => {
    try{
        const _id = req.body;
        const userData = await Expert.findOne({ _id });
        if(!userData){
            return res.status(404).json({
                message: "No data found"
            })
        }

        return res.status(200).json({
            userData: userData
        })
    }catch(err){
        res.status(500).json({
            error: err.message
        })
    }
});
  
  module.exports = router;