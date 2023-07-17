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

// The cost of all buildings in a province
const buildings = {
  house: {
      food: 50,
      fuel: 0,
      tools: 50,
      material: 150
  },
  mine: {
      food: 50,
      fuel: 50,
      tools: 150,
      material: 0
  },
  workshop: {
      food: 0,
      fuel: 50,
      tools: 50,
      material: 150
  },
  farm: {
      food: 0,
      fuel: 0,
      tools: 100,
      material: 150
  },
  fort: {
      food: 0,
      fuel: 0,
      tools: 50,
      material: 200
  },
  none: {
      food: 0,
      fuel: 0,
      tools: 0,
      material: 0
  }
};

module.exports = { 
  flavors, terrains, firstNames, lastNames, buildings
};