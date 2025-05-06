const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    expert: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expert',
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Chat', chatSchema);
