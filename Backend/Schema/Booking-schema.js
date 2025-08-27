const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    expertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expert',
        required: true
    },
    clientName: {
        type: String,
        required: true
    },
    clientPhone: {
        type: String,
        required: true
    },
    expertName: {
        type: String,
        required: true
    },
    expertProfession: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    message: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Booking", bookingSchema);
