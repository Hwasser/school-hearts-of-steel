const mongoose = require('mongoose');

/**
 * creator: The username of the creator of the game
 * max_slots: Max number of players that can join the game
 * slot_names: The username of the player of each slot
 * slot_ids: The document id of the users in each slot
 * food, tools, materials, fuel: Resources of each player in the same
 *                               order as the slot_names and slot_ids
 * score: The score of each player, will be showed at the end of the game
 * upgrades: The document id of each players upgrade tree
 * world_size: The number of provinces in the current game
 * time: How many game "hours" the session have gone for
 */
const SessionSchema = new mongoose.Schema({
    creator: {
        type: String,
        required: true
    },
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
    score: {
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