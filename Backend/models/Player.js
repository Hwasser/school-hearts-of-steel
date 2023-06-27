const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    food: {
        type: Number,
        required: true
    },
    fuel: {
        type: Number,
        required: true
    },
    material: {
        type: Number,
        required: true
    },
    tools: {
        type: Number,
        required: true
    }
});

module.exports = Player = mongoose.model('player', PlayerSchema);