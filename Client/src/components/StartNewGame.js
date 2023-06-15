import axios from 'axios';

export default function StartNewGame(updateProvinceNames) {
    // TODO: Remember this is specified here!
    const nProvinces = 9;
    const allProvinces = Array(9);

    // Get list of all provinces
    axios
    .get('http://localhost:8082/api/provinces')
    .then((res) => {
      const response = res.data;
      
      // If the list of provinces is empty, creaty new onse
      if (response.length == 0) {
        createNewProvinces(nProvinces, allProvinces);
      } else {
        // Otherwise replace all provinces
        for (let i = 0; i < nProvinces; i++) {
            const id = response[i]['_id']
            const province = generateProvince(i);
            allProvinces[i] = province['name']; // Return this back to the main view
            axios
            .put(`http://localhost:8082/api/provinces/${id}`, province)
            .catch((err) => {
              console.log('Error in replacing province: ' + err);
            });

        }
      }
      // Update the names of all provinces in the view
      updateProvinceNames(allProvinces);
    })
    .catch((err) => {
      // If provinces doesn't exist then return false to create new ones
      console.log('Error from getting provinces:' + err);
      
    });

    return allProvinces;

}


// Create province data for 'nProvinces' and posts them to the server
function createNewProvinces(nProvinces, allProvinces) {
    for (let i = 0; i < nProvinces; i++) {
        const province = generateProvince(i); 
        allProvinces[i] = province['name'];

        axios
        .post('http://localhost:8082/api/provinces', province)
        .catch((err) => {
            console.log('Error in creating a province!');
            
        });
        console.log('created province: ' + province);
    }
    return allProvinces;
}

// Generates a province with an id with random properties
function generateProvince(id) {
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
      workforce: getRandomInt(10, 100)
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

const firstName = ['Beavers', 'Cats', 'Dogs', 'Scrap', 'Farmers', 'Nukes', 'Mutants', 'Radiation', 'Raiders', 'Peace', 'Clean', 'Dead']

const lastName = ['ville', 'town', 'bridge', 'river', 'ridge', 'by', 'wood', 'shire', 'lake']