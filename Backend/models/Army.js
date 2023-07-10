const mongoose = require('mongoose');

const ArmySchema = new mongoose.Schema({
    soldiers: {
        type: Number,
        required: true
    },
    militia: {
        type: Number,
        required: false
    },
    demolition_maniac: {
        type: Number,
        required: false
    },
    gun_nut: {
        type: Number,
        required: false
    },
    fortified_truck: {
        type: Number,
        required: false
    },
    power_suit: {
        type: Number,
        required: false
    },
    raiders: {
        type: Number,
        required: false
    },
    owner: {
        type: String,
        required: true
    }
});

module.exports = Army = mongoose.model('army', ArmySchema);