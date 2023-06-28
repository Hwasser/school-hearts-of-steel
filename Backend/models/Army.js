const mongoose = require('mongoose');

const ArmySchema = new mongoose.Schema({
    soldiers: {
        type: Number,
        required: true
    },
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    owner_name: {
        type: String,
        required: true
    }
});

module.exports = Army = mongoose.model('army', ArmySchema);