/**
 * This file contains the stats and cost of all units in the game
 */

const units = {
    militia: {
        type: 'militia',
        name: 'Militia',
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
        damage_low: 4,
        damage_high: 10,
        piercing: 7,
        hardness: 0.10,
        hp: 20,
        cost : {
            food: 5,
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
        damage_low: 8,
        damage_high: 16,
        piercing: 2,
        hardness: 0.10,
        hp: 20,
        cost : {
            food: 5,
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
        damage_low: 6,
        damage_high: 14,
        piercing: 4,
        hardness: 0.50,
        hp: 40,
        cost : {
            food: 6,
            fuel: 6,
            tools: 2,
            material: 2
        },
        attack_mod: {
            'plain': 1.20,
            'forest': 0.80,
            'mountain': 0.80,
            'swamp': 0.60,
            'urban': 0.80
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
        damage_low: 12,
        damage_high: 20,
        piercing: 8,
        hardness: 0.80,
        hp: 30,
        cost : {
            food: 6,
            fuel: 4,
            tools: 5,
            material: 5
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
            'urban': 1.25
        },
        info: "Feared unit. Strong in urban areas"
    },
    mutant: {
        type: 'mutant',
        name: 'Mutant',
        damage_low: 2,
        damage_high: 18,
        piercing: 2,
        hardness: 0.40,
        hp: 40,
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
            'forest': 1.25,
            'mountain': 1.10,
            'swamp': 1.25,
            'urban': 1.10
        },
        info: "Mutaded monster. Strong in forest and swamp"
    }
};

module.exports = { 
    units
};