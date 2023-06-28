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
    }
});

module.exports = Session = mongoose.model('session', SessionSchema);