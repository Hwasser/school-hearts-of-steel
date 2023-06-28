import axios from 'axios';

/**
 * All logic for starting a new game
 */

export default function startNewGame(starterData, slots) {
    // TODO: Remember this is specified here!
    const nProvinces = 9;

    const playerPositions = setPlayerPositions(starterData, slots);

    const allProvinces = setUpProvinces(playerPositions)

    // Get list of all provinces
    axios
    .get('http://localhost:8082/api/provinces')
    .then((res) => {
      const response = res.data;

      console.log(res.data);
      
      // If the list of provinces is empty, creaty new ones
      if (response.length == 0) {
        createNewProvinces(allProvinces);
      } else {
        // Otherwise replace all provinces
        replaceProvinces(allProvinces, response)
      }
    })
    .catch((err) => {
      // If provinces doesn't exist then return false to create new ones
      console.log('Error from getting provinces:' + err);
      
    });
}

// Setup randomly generated provinces, set up player start positions etc
function setUpProvinces(playerPositions) {
  const allProvinces = Array(9);
  const nProvinces = playerPositions.length;
  for (let i = 0; i < nProvinces; i++) {
    const player = playerPositions[i];
    const province = generateProvince(i, player); 
    allProvinces[i] = province;
  }
  return allProvinces;
}

// Replace the provinces in the db with the newly generated
function replaceProvinces(allProvinces, response) {
  const nProvinces = allProvinces.length;
  for (let i = 0; i < nProvinces; i++) {
    const id = response[i]['_id']
    allProvinces[i]['objectId'] = id;
    const province = allProvinces[i];
    axios
    .put(`http://localhost:8082/api/provinces/${id}`, province)
    .catch((err) => {
      console.log('Error in replacing province: ' + err);
    });
  }
  console.log("Restarted game!");
  // Remove all armies from old game
  axios
    .delete(`http://localhost:8082/api/armies/`)
    .then( (res) => {
      console.log("All old armies removed!");
    })
    .catch((err) => {
      console.log('Error in removing armies: ' + err);
    });

}

// Post newly generated provinces to db
function createNewProvinces(allProvinces) {
  const nProvinces = allProvinces.length;
    for (let i = 0; i < nProvinces; i++) {
      const province = allProvinces[i];
      axios
      .post('http://localhost:8082/api/provinces', province)
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
function generateProvince(id, player) {
    const name = generateRandomName();

    const province = {
      id: id,
      name: name['first'] + name['last'],
      houses: getRandomInt(1, 3),
      workshops: getRandomInt(0, 2),
      farms: getRandomInt(0, 2),
      mines: getRandomInt(0, 2),
      forts: getRandomInt(0, 2),
      food: getRandomInt(100, 1000),
      fuel: getRandomInt(100, 1000),
      material: getRandomInt(100, 1000),
      tools: getRandomInt(100, 1000),
      workforce: getRandomInt(10, 100),
      owner: player.name,
      army1: null,
      army2: null,
      army3: null,
      army4: null
    };

    // Set some special stats to provinces associated with certain names
   
    // If the province is radiated
    if (name['first'] == 'Dead' || name['first'] == 'Radiation' || name['first'] == 'Nukes') {
      province['farms'] = 0;
      province['houses'] = 0;
      province['fuel'] += 1000;
    }

    // If the province is clean and peaceful
    if (name['first'] == 'Farmers' || name['first'] == 'Clean' || name['first'] == 'Peace') {
      province['farms'] += 1;
      province['houses'] += 1;
      province['food'] += 100;
    }

    // If the province is hostile
    if (name['first'] == 'Raiders' || name['first'] == 'Mutants') {
      province['workshops'] += 1;
      province['forts'] += 2;
      province['farms'] = 0;
      province['workforce'] += 10;
    }

    if (name['first'] == 'Scrap') {
      province['material'] += 1000;
      province['tools'] += 250;
    }

    return province;
}

// Returns a random number between 'min' and 'min + range'
function getRandomInt(min, range) {
    return min + Math.floor(Math.random() * range);
  }

// Generates a random name for a province, using a combination of the first and last name below
function generateRandomName() {
    const firstNumber = Math.floor(Math.random() * firstName.length);
    const lastNumber = Math.floor(Math.random() * lastName.length);

    return {first: firstName[firstNumber], last: lastName[lastNumber]};
}

const firstName = ['Beavers', 'Cats', 'Dogs', 'Scrap', 'Farmers', 'Nukes', 'Mutants', 'Radiation', 'Raiders', 'Peace', 'Clean', 'Dead'];

const lastName = ['ville', 'town', 'bridge', 'river', 'ridge', 'by', 'wood', 'shire', 'lake'];


// Set up the position of all players
// VARIANT: 1 <= n of players <= 4 
function setPlayerPositions(startPlayer, slots) {
  const playerPositions = Array(9).fill({name: 'Neutral', id: null});

  playerPositions[0] = {name: startPlayer.name, id: startPlayer._id};

  if (slots == 2) {
    playerPositions[8] = {name: 'player2', id: null};
  }
  if (slots == 3) {
    playerPositions[2] = {name: 'player2', id: null};
    playerPositions[7] = {name: 'player3', id: null};
  }
  if (slots == 4) {
    playerPositions[2] = {name: 'player2', id: null};
    playerPositions[6] = {name: 'player3', id: null};
    playerPositions[8] = {name: 'player4', id: null};
  }

  return playerPositions;
}