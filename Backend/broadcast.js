const Session = require('./models/Session');
const Province = require('./models/Province');

const gameSessions = [];
const timePerUpdate = 5000;
let broadcastClients = [];
const daily_salary = [];

function gameSessionStart(id) {
    try {
        console.log("broadcast: started game session", id);
        // A loop for updating resources for all users
        const sessionLoop = setInterval(() => {
            updateResources(id);
        }, timePerUpdate);
        // Add session to list of sessions
        const gameSession = {id: id, loop: sessionLoop};
        gameSessions.push(gameSession);
    } catch (err) {
        console.log("broadcast: Failed to start game session:", err);
    }
}

// TODO: Stops all game sessions for now and end their loops
function gameSessionStop() {
    while (gameSessions.length != 0) {
        const gameSession = gameSessions.pop();
        clearInterval(gameSession.loop);
    }
}

function gameSessionSetupClients(clients) {
    broadcastClients = clients;
}

function updateProvince(province) {
    try {
        const message = JSON.stringify({purpose: 'update_province', package: province});
        broadcastMessage(message);
    } catch (err) {
        console.log("Failed to update province:", err);
    }
}


// Function to send SSE messages to all clients
function broadcastMessage(message) {
    broadcastClients.forEach(client => {
      client.res.write(`data: ${message}\n\n`); // Send SSE message to client
    });
  }

async function updateResources(id) {
    try {
        const provinces = await Province.find({});
        const sessions = await Session.findById(id);
        const nUsers = sessions.max_slots;
        // Change value
        const userResources = mineResources(nUsers, provinces, sessions.slot_names)
        for (let i = 0; i < nUsers; i++) {
            updatePerUser(i, sessions, userResources);
        }
        // Store and broadcast updated value
        sessions.save();
        for (let i = 0; i < provinces.length; i++) {
            provinces[i].save();
        }
        const message = JSON.stringify({purpose: 'update_resources', package: sessions});
        broadcastMessage(message);
    } catch (err) {
        console.log("Couldnt update res:", err);
    }
}

// TODO: Do correct updates per user depending on provinces
function updatePerUser(slotIndex, document, userResources) {
    document.food[slotIndex]     += userResources[slotIndex].food;
    document.fuel[slotIndex]     += userResources[slotIndex].fuel;
    document.tools[slotIndex]    += userResources[slotIndex].tools;
    document.material[slotIndex] += userResources[slotIndex].material;
}

function mineResources(nUsers, provinces, users) {
    // The resources to mine per player
    userResources = [
        {'food': 0, 'fuel': 0, 'tools': 0, 'material': 0},
        {'food': 0, 'fuel': 0, 'tools': 0, 'material': 0},
        {'food': 0, 'fuel': 0, 'tools': 0, 'material': 0},
        {'food': 0, 'fuel': 0, 'tools': 0, 'material': 0}
    ];
    
    for (let i = 0; i < provinces.length; i++) {
        const province = provinces[i];
        const slot = users.findIndex( (e) => e == province.owner);
        // If no player owns the province, skip to the next one
        if (slot == -1) {
            continue;
        }
        // Add resources and drain resources from provinces when scavanging
        scavangeFood = scavangeResource(provinces, i, province.workforce, 'food');
        userResources[slot]['food'] += province.farms * 5 + scavangeFood;
        scavangeFuel = scavangeResource(provinces, i, province.workforce, 'fuel');
        userResources[slot].fuel += scavangeFuel;
        scavangeTools = scavangeResource(provinces, i, province.workforce, 'tools');
        userResources[slot].tools += province.workshops * 5 + scavangeTools;
        scavangeMaterial = scavangeResource(provinces, i, province.workforce, 'material');
        userResources[slot].material += province.mines * 5 + scavangeMaterial;
        // Also add manpower to the province
        provinces[i]['workforce'] += province.houses;
    }

    return userResources;
}

/**
 * @brief: Make the inhabitants of the province scavange resources
 * 
 * @param {dict} provinces 
 * @param {int} n 
 * @param {int} workforce 
 * @param {string} resource 
 * @returns An integer of how much resources are being scavanged from a province
 */
function scavangeResource(provinces, n, workforce, resource) {
    const scavangeRatio = 0.10; // How much resources to scavange per manpower
    const scavangeRes = Math.floor(workforce * scavangeRatio);
    const scavangeResActual = (scavangeRes > provinces[n][resource]) ? 0 : scavangeRes; 
    provinces[n][resource] -= scavangeResActual;
    return scavangeResActual;
}

module.exports = { gameSessionStart, gameSessionStop, gameSessionSetupClients, updateProvince };

