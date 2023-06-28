const mongoose = require('mongoose');

const ArmySchema = new mongoose.Schema({
    soldiers: {
        type: Number,
        required: true
    },
    owner: {
        type: String,
        required: true
    }
});

module.exports = Army = mongoose.model('army', ArmySchema);