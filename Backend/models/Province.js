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
    session: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    flavor: {
        type: String,
        required: true
    },
    terrain: {
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
    },

    owner: {
        type: String,
        required: true
    },

    army1: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    army2: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    army3: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    army4: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    }
});

module.exports = Province = mongoose.model('province', ProvinceSchema);