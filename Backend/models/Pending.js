const mongoose = require('mongoose');

/**
 * @brief: Pending actions
 * 
 * type: 'building', 'move', 'battle', 'upgrade'
 * session: The game session this pending action appears in
 * player: The player that spawned this 
 * start: The start time
 * end: The time in which the action should occur
 * provinceID: The province._id where this action takes place
 * provinceN: The province number where this action takes place
 * 
 * (not required):
 * province2ID: When moving between provinces
 * province2N: When moving between provinces
 * army_id: The attacking army
 * text: for example the building or upgrade name
 */
const PendingSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    session: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    player: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    start: {
        type: Number,
        required: true
    },
    end: {
        type: Number,
        required: true
    },
    provinceID: {
        type:  mongoose.Schema.Types.ObjectId,
        required: true
    },
    province2ID: {
        type:  mongoose.Schema.Types.ObjectId,
        required: false
    },
    provinceN: {
        type:  Number,
        required: true
    },
    province2N: {
        type:  Number,
        required: false
    },
    army_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    text: {
        type: String,
        required: false
    }
});

module.exports = Pending = mongoose.model('pending', PendingSchema);