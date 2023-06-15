const mongoose = require('mongoose');

const ProvinceSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },

    houses: {
        type: Number,
        required: true
    },
    workshops: {
        type: Number,
        required: true
    },
    farms: {
        type: Number,
        required: true
    },
    mines: {
        type: Number,
        required: true
    },

    forts: {
        type: Number,
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
    },

    workforce: {
        type: Number,
        required: true
    }
});

module.exports = Province = mongoose.model('province', ProvinceSchema);