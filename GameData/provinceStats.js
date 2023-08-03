/**
 * This file contains names, flavors and terrains for provinces
 */

// This affects how this province will be set up.
// Both province name, buildings, resources and type of neutral army will be affected
const flavors = ['normal', 'raider', 'radiation', 'healthy'];

// Plain double to make it most common - urban and radiation are unique terrains
const terrains = ['plain', 'plain', 'forest', 'mountain', 'swamp', 'urban'] 

// VARIANT: firstNames depends on flavor
const firstNames = {
  normal: ['Cats', 'Dogs', 'Scrap', 'Up', 'East', 'West', 'North', 'South', 'Far', 'Olds', 'Small'],
  healthy: ['Farmers', 'Shepherds', 'Good', 'Well', 'Nice', 'Happy', 'Grass'],
  raider: ['Raiders', 'Murder', 'Blood', 'Pirate'],
  radiation: ['Radiation', 'Mutant', 'Monster', 'Death', 'Poison', 'Strange']
}

// VARIANT: lastNames depends on terrain
const lastNames = {
  plain: ['field', 'plains', 'spring', 'well', 'by'],
  forest: ['wood', 'grove', 'timber', 'park', ' wilderness'],
  mountain: ['peak', 'mountain', 'view', 'hills', ' summit', ' pinnacle'],
  swamp: ['swamp', 'marsh', ' wetlands', 'mud', 'mire'],
  urban: ['town', 'ville', ' City', ' Village', ' District', 'burgh', ' Metropolis']
}

// Stats of all buildings
const buildings = {
  houses: {
    cost: {
      food: 40,
      fuel: 0,
      tools: 30,
      material: 100
    },
    growth: {
      food: 10,
      fuel: 0,
      tools: 10,
      material: 20
    },
    time: 4,
    info: "Increases the workforce each hour"
  },
  mines: {
    cost: {
      food: 30,
      fuel: 30,
      tools: 100,
      material: 0
    },
    growth: {
      food: 10,
      fuel: 10,
      tools: 20,
      material: 0
    },
    time: 4,
    info: "Excavates building material each hour"
  },
  workshops: {
    cost: {
      food: 30,
      fuel: 30,
      tools: 0,
      material: 100
    },
    growth: {
      food: 10,
      fuel: 10,
      tools: 0,
      material: 20
    },
    time: 4,
    info: "Constructs new tools each hour"
  },
  farms: {
    cost: {
      food: 0,
      fuel: 0,
      tools: 60,
      material: 100
    },
    growth: {
      food: 0,
      fuel: 10,
      tools: 10,
      material: 20
    },
    time: 4,
    info: "Generates food each hour"
  },
  forts: {
    cost: {
      food: 20,
      fuel: 0,
      tools: 40,
      material: 100
    },
    growth: {
      food: 10,
      fuel: 0,
      tools: 10,
      material: 20
    },
    time: 4,
    info: "Increases defences by 10%"
  },
  none: {
    cost: {
      food: 0,
      fuel: 0,
      tools: 0,
      material: 0
    },
    growth: {
      food: 0,
      fuel: 0,
      tools: 0,
      material: 0
    },
    time: 0,
    info: "-"
  },
};

module.exports = { 
  flavors, terrains, firstNames, lastNames, buildings
};