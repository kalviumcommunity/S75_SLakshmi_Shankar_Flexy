const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    licenseFile: {
        filename: { type: String, required: true },
        path: { type: String, required: true },
        mimetype: { type: String },
        size: { type: Number }
    },
    profession: {
        type: String,
        required: true
    },
    exp: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Expert", expertSchema);