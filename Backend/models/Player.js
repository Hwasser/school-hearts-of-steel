const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    slot: {
        type: Number,
        required: false
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