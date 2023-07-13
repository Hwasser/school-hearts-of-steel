/**
 * This file contains names, flavors and terrains for provinces
 */

const flavors = ['normal', 'raider', 'radiation', 'healthy'];

// Plain double to make it most common - urban and radiation are unique terrains
const terrains = ['plain', 'plain', 'forest', 'mountain', 'swamp', 'urban'] 

// VARIANT: firstNames depends on flavor
const firstNames = {
  normal: ['Cats', 'Dogs', 'Up', 'East', 'West', 'North', 'South', 'Far', 'Olds', 'Small'],
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

module.exports = { 
  flavors, terrains, firstNames, lastNames
};