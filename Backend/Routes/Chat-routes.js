const express = require('express');
const router = express.Router();
const Chat = require('../Schema/Chat-schema');
const auth = require('../middleware/auth');

// Input validation helper
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/* -------------------- GET CHAT HISTORY -------------------- */
router.get('/chat/:clientId/:expertId', auth, async (req, res) => {
  try {
    const { clientId, expertId } = req.params;

    // Validate IDs
    if (!isValidObjectId(clientId) || !isValidObjectId(expertId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid client or expert ID format' 
      });
    }

    // Verify user is authorized to view this chat
    const userRole = req.user.role;
    const userId = req.user._id;

    if (userRole === 'client' && userId.toString() !== clientId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized to view this chat' 
      });
    }

    if (userRole === 'expert' && userId.toString() !== expertId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized to view this chat' 
      });
    }

    // Get messages
    const messages = await Chat.find({
      client: clientId,
      expert: expertId
    }).sort({ timestamp: 1 });

    res.json({ 
      success: true, 
      messages 
    });
  } catch (err) {
    console.error('Error fetching chat history:', err);
    res.status(500).json({ 
      success: false, 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server error' 
    });
  }
});

/* -------------------- SAVE NEW MESSAGE -------------------- */
router.post('/chat', auth, async (req, res) => {
  try {
    const { client, expert, sender, message } = req.body;

    // Validate required fields
    if (!client || !expert || !sender || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields (client, expert, sender, message) are required' 
      });
    }

    // Validate IDs
    if (!isValidObjectId(client) || !isValidObjectId(expert)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid client or expert ID format' 
      });
    }

    // Validate sender
    if (!['client', 'expert'].includes(sender)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Sender must be either "client" or "expert"' 
      });
    }

    // Verify authorization
    const userRole = req.user.role;
    const userId = req.user._id;

    if (userRole === 'client' && (userId.toString() !== client || sender !== 'client')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized to send message as this user' 
      });
    }

    if (userRole === 'expert' && (userId.toString() !== expert || sender !== 'expert')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized to send message as this user' 
      });
    }

    // Create and save message
    const newMessage = new Chat({ 
      client, 
      expert, 
      sender, 
      message 
    });
    
    await newMessage.save();

    res.json({ 
      success: true, 
      message: newMessage 
    });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ 
      success: false, 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Server error' 
    });
  }
});

module.exports = router;
