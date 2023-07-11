/**
 * This file contains the stats and cost of all units in the game
 */

const units = {
    militia: {
        soft_attack: 10,
        hard_attack: 1,
        hardness: 0,
        hp: 20,
        cost : {
            food: 5,
            fuel: 0,
            tools: 1,
            material: 0
        }
    },
    demolition_maniac: {
        soft_attack: 8,
        hard_attack: 8,
        hardness: 10,
        hp: 20,
        cost : {
            food: 5,
            fuel: 3,
            tools: 2,
            material: 0
        }
    },
    gun_nut: {
        soft_attack: 15,
        hard_attack: 2,
        hardness: 10,
        hp: 20,
        cost : {
            food: 5,
            fuel: 0,
            tools: 5,
            material: 0
        }
    },
    fortified_truck: {
        soft_attack: 12,
        hard_attack: 4,
        hardness: 60,
        hp: 30,
        cost : {
            food: 5,
            fuel: 10,
            tools: 3,
            material: 5
        }
    },
    power_suit: {
        soft_attack: 16,
        hard_attack: 6,
        hardness: 90,
        hp: 25,
        cost : {
            food: 5,
            fuel: 5,
            tools: 6,
            material: 10
        }
    },
    raider: {
        soft_attack: 12,
        hard_attack: 2,
        hardness: 25,
        hp: 20,
        cost : {
            food: 2,
            fuel: 0,
            tools: 1,
            material: 0
        }
    }
};

module.exports = { 
    units
};