const express = require('express');
const router = express.Router();
const Client = require("../Schema/Client-schema");

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
  
  module.exports = router;