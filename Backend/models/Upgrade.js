const mongoose = require('mongoose');

// An upgrade tree for a player in a session

const UpgradeSchema = new mongoose.Schema({
    upg_weap1: {
        type: Boolean,
        required: true
    },
    upg_weap2_dam: {
        type: Boolean,
        required: true
    },
    upg_weap2_arm: {
        type: Boolean,
        required: true
    },
    upg_weap2_mot: {
        type: Boolean,
        required: true
    },
    upg_weap3_dam: {
        type: Boolean,
        required: true
    },
    upg_weap3_arm: {
        type: Boolean,
        required: true
    },
    upg_tech1: {
        type: Boolean,
        required: true
    },
    upg_tech2: {
        type: Boolean,
        required: true
    },
    upg_tech3: {
        type: Boolean,
        required: true
    }
});

module.exports = Upgrade = mongoose.model('upgrade', UpgradeSchema);