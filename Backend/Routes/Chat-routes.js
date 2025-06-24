const express = require('express');
const router = express.Router();
const Chat = require('../Schema/Chat-schema');

// Get chat history
router.get('/chat/:clientId/:expertId', async (req, res) => {
    const { clientId, expertId } = req.params;

    try {
        const messages = await Chat.find({
            client: clientId,
            expert: expertId
        }).sort({ timestamp: 1 });

        res.json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Save new message
router.post('/chat', async (req, res) => {
    const { client, expert, sender, message } = req.body;

    try {
        const newMessage = new Chat({ client, expert, sender, message });
        await newMessage.save();
        res.json({ success: true, message: newMessage });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
