/**
 * This file contains the stats and cost of all units in the game
 */

const units = {
    militia: {
        type: 'militia',
        name: 'Militia',
        travel_time: 4,
        damage_low: 6,
        damage_high: 10,
        piercing: 1,
        hardness: 0,
        hp: 20,
        cost : {
            food: 5,
            fuel: 0,
            tools: 1,
            material: 0
        },
        attack_mod: {
            'plain': 1,
            'forest': 0.90,
            'mountain': 0.90,
            'swamp': 0.90,
            'urban': 0.90
        },
        defence_mod: {
            'plain': 1,
            'forest': 1.10,
            'mountain': 1.10,
            'swamp': 1.10,
            'urban': 1.10
        },
        info: "Basic armed civilians"
    },
    demolition_maniac: {
        type: 'demolition_maniac',
        name: 'Demolition Maniac',
        travel_time: 4,
        damage_low: 4,
        damage_high: 10,
        piercing: 6,
        hardness: 0.10,
        hp: 20,
        cost : {
            food: 7,
            fuel: 2,
            tools: 2,
            material: 0
        },
        attack_mod: {
            'plain': 1,
            'forest': 0.90,
            'mountain': 0.90,
            'swamp': 0.90,
            'urban': 0.90
        },
        defence_mod: {
            'plain': 1,
            'forest': 1.10,
            'mountain': 1.10,
            'swamp': 1.10,
            'urban': 1.10
        },
        info: "Good against armored units"
    },
    gun_nut: {
        type: 'gun_nut',
        name: 'Gun Nut',
        travel_time: 4,
        damage_low: 8,
        damage_high: 14,
        piercing: 2,
        hardness: 0.10,
        hp: 20,
        cost : {
            food: 7,
            fuel: 0,
            tools: 4,
            material: 0
        },
        attack_mod: {
            'plain': 1.10,
            'forest': 0.90,
            'mountain': 0.90,
            'swamp': 0.90,
            'urban': 0.90
        },
        defence_mod: {
            'plain': 1.10,
            'forest': 1.10,
            'mountain': 1.10,
            'swamp': 1.10,
            'urban': 1.10
        },
        info: "Good against non-armored units"
    },
    fortified_truck: {
        type: 'fortified_truck',
        name: 'Fortified Truck',
        travel_time: 2,
        damage_low: 6,
        damage_high: 14,
        piercing: 4,
        hardness: 0.50,
        hp: 30,
        cost : {
            food: 8,
            fuel: 6,
            tools: 2,
            material: 2
        },
        attack_mod: {
            'plain': 1.20,
            'forest': 0.85,
            'mountain': 0.85,
            'swamp': 0.75,
            'urban': 0.9
        },
        defence_mod: {
            'plain': 1,
            'forest': 0.90,
            'mountain': 0.90,
            'swamp': 0.80,
            'urban': 1
        },
        info: "Weak in rough and wet terrain"
    },
    power_suit: {
        type: 'power_suit',
        name: 'Power Suit',
        travel_time: 3,
        damage_low: 10,
        damage_high: 16,
        piercing: 8,
        hardness: 0.80,
        hp: 25,
        cost : {
            food: 10,
            fuel: 3,
            tools: 6,
            material: 6
        },
        attack_mod: {
            'plain': 1,
            'forest': 0.90,
            'mountain': 0.90,
            'swamp': 0.90,
            'urban': 0.90
        },
        defence_mod: {
            'plain': 1,
            'forest': 1.10,
            'mountain': 1.10,
            'swamp': 1.10,
            'urban': 1.10
        },
        info: "Powerful unit in steel suit"
    },
    raider: {
        type: 'raider',
        name: 'Raider',
        travel_time: 3,
        damage_low: 2,
        damage_high: 12,
        piercing: 2,
        hardness: 0.25,
        hp: 25,
        cost : {
            food: 0,
            fuel: 0,
            tools: 0,
            material: 0
        },
        attack_mod: {
            'plain': 1,
            'forest': 1,
            'mountain': 1,
            'swamp': 1,
            'urban': 1
        },
        defence_mod: {
            'plain': 1,
            'forest': 1.10,
            'mountain': 1.10,
            'swamp': 1.10,
            'urban': 1.20
        },
        info: "Feared unit. Strong in urban areas"
    },
    mutant: {
        type: 'mutant',
        name: 'Mutant',
        travel_time: 4,
        damage_low: 3,
        damage_high: 16,
        piercing: 3,
        hardness: 0.40,
        hp: 30,
        cost : {
            food: 0,
            fuel: 0,
            tools: 0,
            material: 0
        },
        attack_mod: {
            'plain': 1,
            'forest': 1,
            'mountain': 1,
            'swamp': 1,
            'urban': 1
        },
        defence_mod: {
            'plain': 1,
            'forest': 1.20,
            'mountain': 1.10,
            'swamp': 1.20,
            'urban': 1.10
        },
        info: "Mutaded monster. Strong in forest and swamp"
    }
};

module.exports = { 
    units
};