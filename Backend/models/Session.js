const mongoose = require('mongoose');

// A game session

const SessionSchema = new mongoose.Schema({
    max_slots: {
        type: Number,
        required: true
    },
    slot_names: {
        type: [String],
        required: true
    },
    slot_ids: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
    },
    food: {
        type: [Number],
        required: true
    },
    fuel: {
        type: [Number],
        required: true
    },
    material: {
        type: [Number],
        required: true
    },
    tools: {
        type: [Number],
        required: true
    },
    upgrades: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
    },
    world_size: {
        type: Number,
        required: true
    },
    time: {
        type: Number,
        required: true
    }
});

module.exports = Session = mongoose.model('session', SessionSchema);