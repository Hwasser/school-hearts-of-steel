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
    demolition_maniacs: {
        type: Number,
        required: false
    },
    gun_nuts: {
        type: Number,
        required: false
    },
    fortified_trucks: {
        type: Number,
        required: false
    },
    power_suits: {
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