/**
 * This file contains all information regarding upgrades in the game
 */

// The name of all upgrades
const upgradeNames = {
    upg_weap1: 'Improved Weapons',
    upg_weap2_dam: 'Standardized Ammunition',
    upg_weap2_arm: 'Riot Helmets',
    upg_weap2_mot: 'Motorization',
    upg_weap3_dam: 'Master Gunsmiths',
    upg_weap3_arm: 'Kevlar',
    upg_tech1: 'Improved Tools',
    upg_tech2: 'Advanced Tools',
    upg_tech3: 'Motorized Scavanging'
};

// The text description of all upgrades
const upgradeTexts = {
    upg_weap1: 'Improved weapons will allow more for more advanced units',
    upg_weap2_dam: 'Standardized ammunition increases the damage of all units with 10%',
    upg_weap2_arm: 'Riot Helmets will add 10% hardness for all units',
    upg_weap2_mot: 'Motorization will allow the production of motorized units',
    upg_weap3_dam: 'Master gunsmiths increases the damage of all units with 20%',
    upg_weap3_arm: 'Kevlar will add 20% hardness for all units',
    upg_tech1: 'Improved Tools will increase the output of all resource gathering with 10%',
    upg_tech2: 'Advanced Tools will increase the output of all resource gathering with 20%',
    upg_tech3: 'Motorized Scavanging will increase the output of all resource gathering with 30%'
};

// Dependecies of each upgrade
const upgradeDependencies = {
    upg_weap1: [],
    upg_weap2_dam: ['upg_weap1'],
    upg_weap2_arm: ['upg_weap1'],
    upg_weap2_mot: ['upg_weap1', 'upg_tech1'],
    upg_weap3_dam: ['upg_weap2_dam'],
    upg_weap3_arm: ['upg_weap2_arm'],
    upg_tech1:     [],
    upg_tech2:     ['upg_tech1'],
    upg_tech3:     ['upg_tech2', 'upg_weap2_mot'],
    upg_gunnut:    ['upg_weap1'],
    upg_demman:    ['upg_weap1'],
    upg_formot:    ['upg_weap2_mot'],
    upg_powsui:    ['upg_weap2_dam', 'upg_weap2_arm', 'upg_tech2']
};

// The init state of all upgrades
const initUpgrades = {
    upg_weap1: false,
    upg_weap2_dam: false,
    upg_weap2_arm: false,
    upg_weap2_mot: false,
    upg_weap3_dam: false,
    upg_weap3_arm: false,
    upg_tech1: false,
    upg_tech2: false,
    upg_tech3: false
};

// The cost of each upgrade
const upgradeCosts = {
    upg_weap1: {
        food: 100,
        tools: 0,
        fuel: 0,
        material: 100
    },
    upg_weap2_dam: {
        food: 0,
        tools: 150,
        fuel: 50,
        material: 100
    },
    upg_weap2_arm: {
        food: 0,
        tools: 100,
        fuel: 50,
        material: 150
    },
    upg_weap2_mot: {
        food: 0,
        tools: 50,
        fuel: 100,
        material: 50
    },
    upg_weap3_dam: {
        food: 0,
        tools: 250,
        fuel: 100,
        material: 100
    },
    upg_weap3_arm: {
        food: 0,
        tools: 100,
        fuel: 100,
        material: 250
    },
    upg_tech1: {
        food: 100,
        tools: 100,
        fuel: 0,
        material: 100
    },
    upg_tech2: {
        food: 200,
        tools: 200,
        fuel: 200,
        material: 200
    },
    upg_tech3: {
        food: 400,
        tools: 400,
        fuel: 400,
        material: 400
    }
}

module.exports = { 
    upgradeNames, upgradeTexts, upgradeCosts, upgradeDependencies, initUpgrades
};