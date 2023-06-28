const mongoose = require('mongoose');

// A game session

const PlayerSchema = new mongoose.Schema({
    max_slots: {
        type: Number,
        required: true
    },
    slot1: {
        type: String,
        required: true
    },
    food: {
        type: Number,
        required: false
    },
    fuel: {
        type: Number,
        required: false
    },
    material: {
        type: Number,
        required: false
    },
    tools: {
        type: Number,
        required: false
    }
});

module.exports = Player = mongoose.model('player', PlayerSchema);