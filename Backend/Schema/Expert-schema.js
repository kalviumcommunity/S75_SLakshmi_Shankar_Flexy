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