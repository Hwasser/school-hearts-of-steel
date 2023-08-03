import axios from 'axios';
import {host} from '../backend_adress';
const { flavors, terrains, firstNames, lastNames } = require('../GameData/provinceStats');

/**
 * All logic for starting a new game
 */

export default function startNewGame(session) {
  // Number of provinces on the map  
  const nProvinces = session.world_size;
  // How many players can join this game
  const slots = session.max_slots;
  // All the players in the game (free slots are called Player2, Player3 ..)
  const playerNames = session.slot_names;
  // The document id of the Player model for each player, null if slot is free
  const startPlayerId = session.slot_ids[0];
  // A list of the owner of all provinces, including the players and free slots
  const playerPositions = setPlayerPositions(playerNames, startPlayerId, slots, nProvinces);
  // A list of all province objects (same as the Province-model)
  const allProvinces = setUpProvinces(playerPositions, session)
  // Post all provinces to the server
  postNewProvinces(allProvinces, session._id);

}

// Setup randomly generated provinces, set up player start positions etc
function setUpProvinces(playerPositions, session) {
  const nProvinces = playerPositions.length;
  const allProvinces = Array(nProvinces);
  for (let i = 0; i < nProvinces; i++) {
    const player = playerPositions[i];
    const province = generateProvince(i, player, session); 
    allProvinces[i] = province;
  }
  return allProvinces;
}

// Post newly generated provinces to db
async function postNewProvinces(allProvinces, sessionId) {
  const nProvinces = allProvinces.length;
    for (let i = 0; i < nProvinces; i++) {
      const province = allProvinces[i];
      if (province.owner == 'Neutral') {
        const postedArmy = await postArmyToServer(province, sessionId);
        province.armies.push(postedArmy);
      }
      axios
      .post(host + '/api/provinces', province)
      .then( (res) => {
        allProvinces[i]['objectid'] = res.data.province._id;
      })
      .catch((err) => {
          console.log('Error in creating a province: ' + err);
          
      });
    }
    // Update the names of all provinces in the view
}

// Generates a province with an id with random properties
/**
 * @brief: Generates a random province.
 * 
 * @param {Integer} id: The index number of the province 
 * @param {String} player: The name of the player that owns this province
 * @param {String} session: The game session this province is part of
 * @returns {DICT}
 */
function generateProvince(id, player, session) {
    const flavor = (player.name == 'Neutral') ? generateRandomFlavor() : 'normal';
    const terrain = generateRandomTerrain();
    const name = generateRandomName(flavor, terrain);

    // To make the game even for all players we differ on player provinces and neutral provinces
    const province = (player.name == 'Neutral') 
      ? standardProvince(id, session, player, flavor, terrain, name)
      : playerProvince(id, session, player, flavor, terrain, name);

    // -- Set some special stats to provinces associated with certain properties --
    
    // If the province is radiated
    if (flavor == 'radiation') {
      province['farms'] = 0;
      province['houses'] = 0;
      province['fuel'] += 2000;
    }

    // If the province is clean, healthy and peaceful
    if (flavor == 'healthy') {
      province['farms'] += 2;
      province['houses'] += 2;
      province['food'] += 1000;
      province['workforce'] += 25;
    }

    // If the province is hostile
    if (flavor == 'raider') {
      province['workshops'] += 1;
      province['forts'] += 1;
      province['farms'] = 0;
    }

    // Well, if the town is called "scrap" there's probably scrap there
    if (name['first'] == 'Scrap') {
      province['material'] += 1500;
      province['tools'] += 1500;
      province['food'] += 1500;
      province['fuel'] += 1500;
    }

    if (terrain == 'urban') {
      province['houses'] += 1;
      province['workforce'] += 25;
    }


    return province;
}

// Returns a random integer between 'min' and 'min + range'
function getRandomInt(min, range) {
    return min + Math.floor(Math.random() * range);
  }


/**
 * @brief: Generates a random name for a province, using a combination of the first and last name below
 *  
 * @param {String} flavor: Flavor of the province, first name depends on flavor 
 * @param {String} terrain: Terrain of province, last name depends on flavor
 * @returns: A JSON-object containing the first- and last name of the province.
 */
function generateRandomName(flavor, terrain) {
    const firstNumber = Math.floor(Math.random() * firstNames[flavor].length);
    const lastNumber = Math.floor(Math.random() * lastNames[terrain].length);

    return {first: firstNames[flavor][firstNumber], last: lastNames[terrain][lastNumber]};
}

function generateRandomFlavor() {
  const randomChoice = Math.floor(Math.random() * flavors.length);
  return flavors[randomChoice];
}

function generateRandomTerrain() {
  const randomChoice = Math.floor(Math.random() * terrains.length);
  return terrains[randomChoice];
}

// Set up the position for all players
// VARIANT: 1 <= n of players <= 4 
function setPlayerPositions(playerNames, startPlayerId, slots, nProvinces) {
  const playerPositions = Array(nProvinces).fill({name: 'Neutral', id: null});

  const rowSize = Math.sqrt(nProvinces);

  playerPositions[0] = {name: playerNames[0], id: startPlayerId};

  if (slots == 2) {
    playerPositions[nProvinces-1] = {name: playerNames[1], id: null};
  }
  if (slots == 3) {
    playerPositions[rowSize-1] = {name: playerNames[1], id: null};
    playerPositions[nProvinces-Math.ceil(rowSize/2)] = {name: playerNames[2], id: null};
  }
  if (slots == 4) {
    playerPositions[rowSize-1] = {name: playerNames[1], id: null};
    playerPositions[nProvinces-rowSize] = {name: playerNames[2], id: null};
    playerPositions[nProvinces-1] = {name: playerNames[3], id: null};
  }

  return playerPositions;
}

// Post an army to the server and place it in the province
async function postArmyToServer(province, sessionId) {
  const size = Math.round(province.workforce / 2);

  // Create army
  const army = {
    owner: province.owner,
    session: sessionId
  };
  // Add 
  if (province.flavor == 'normal') {
    army['soldiers'] = size;
    army['militia'] = size;
  }
  else if (province.flavor == 'healthy') {
    army['soldiers'] = size+10;
    army['militia'] = size;
    army['gun_nut'] = 10;
  } else if (province.flavor == 'raider') {
    army['soldiers'] = size + 25;
    army['raider'] = size + 25;
  } else {
    army['soldiers'] = size + 10;
    army['mutant'] = size + 10;
  }
 
  let armyId = null;


  await axios
  .post(host + '/api/armies', army)
  .then( (res) => {
    armyId = res.data.armydata._id;
  })
  .catch((err) => {
      console.log('Error in creating army: ' + err);    
  });  
  return armyId;
}

/**
 * @brief: A generated standard province.
 * 
 * @param {Integer} id: The index number of the province 
 * @param {String} session: The game session this province is part of
 * @param {String} player: The name of the player (probably 'Neutral') that owns this province
 * @param {String} flavor: The flavor of this province (see provinceStats)
 * @param {String} terrain: The terrain of this province (see provinceStats)
 * @param {String} name: The name of this province
 * @returns {JSON} containing the province
 */
function standardProvince(id, session, player, flavor, terrain, name) {
  const minRes = 500;
  const maxRes = 5000;
  const minBuild = 0;
  const maxBuild = 2;
  const minMen = 20;
  const maxMen = 200;

  return {
    id: id,
    session: session._id,
    name: name['first'] + name['last'],
    flavor: flavor,
    terrain: terrain,
    houses:    getRandomInt(minBuild, maxBuild),
    workshops: getRandomInt(minBuild, maxBuild),
    farms:     getRandomInt(minBuild, maxBuild),
    mines:     getRandomInt(minBuild, maxBuild),
    forts:     getRandomInt(minBuild, maxBuild),
    food:      getRandomInt(minRes, maxRes),
    fuel:      getRandomInt(minRes, maxRes),
    material:  getRandomInt(minRes, maxRes),
    tools:     getRandomInt(minRes, maxRes),
    workforce: getRandomInt(minMen, maxMen),
    owner: player.name,
    armies: []
  }
}

/**
 * @brief: A generated province for a player slot. 
 *         Explaination for values: Fuel should be 0 in start province to restrict some features
 *         from the user. Houses should be one so that population increase even if the player does
 *         a bad choice.
 * 
 * @param {Integer} id: The index number of the province 
 * @param {String} session: The game session this province is part of
 * @param {String} player: The name of the player that owns this province
 * @param {String} flavor: The flavor of this province (see provinceStats)
 * @param {String} terrain: The terrain of this province (see provinceStats)
 * @param {String} name: The name of this province
 * @returns {JSON} containing the province
 */
function playerProvince(id, session, player, flavor, terrain, name) {
  const stdRes = 2500;

  return {
    id: id,
    session: session._id,
    name: name['first'] + name['last'],
    flavor: flavor, 
    terrain: terrain,
    houses: 1, 
    workshops: 0, 
    farms: 0, 
    mines: 0, 
    forts: 0,
    food: stdRes, 
    fuel: 0, 
    material: stdRes, 
    tools: stdRes, 
    workforce: 60,
    owner: player.name,
    armies: []
  }
}