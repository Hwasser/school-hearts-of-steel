/**
 * Module contains functions that are going to be broadcasted from the server to all clients
 */


const Session = require('./models/Session');
const Province = require('./models/Province');
const Pending = require('./models/Pending');

const gameSessions = {};
const timePerUpdate = 5000;
let broadcastClients = [];

function connectPlayer(token, session, player) {
    broadcastClients.forEach(client => {
        if (client['token'] == token) {
            client['session'] = session;
            client['player'] = player;
        }
    });
    console.log(broadcastClients);
}

function gameSessionStart(id) {
    try {
        console.log("broadcast: started game session", id);
        // A loop for updating resources for all users
        const sessionLoop = setInterval(() => {
            updateSession(id);
        }, timePerUpdate);
        // Add session to all game sessions
        gameSessions[id] = sessionLoop;
    } catch (err) {
        console.log("broadcast: Failed to start game session:", err);
    }
}

// Stops all game sessions for now and end their loops
function gameSessionStop(id) {
    clearInterval(gameSessions[id]);
    delete gameSessions[id];
    console.log("broadcast: Sessions left on server:", gameSessions);
}

function gameSessionSetupClients(clients) {
    broadcastClients = clients;
}

async function broadcastUpdateProvince(province) {
    try {
        const message = {purpose: 'update_province', package: province};
        broadcastMessage(message);
    } catch (err) {
        console.log("Failed to update province:", err);
    }
}

async function broadcastMoveArmy(fromProvince, toProvince) {
    try {
        const message = {purpose: 'move_army', 
            package: {fromProvince: fromProvince, toProvince: toProvince}};
        broadcastMessage(message);
    } catch (err) {
        console.log("Failed to move army:", err);
    }
}

async function broadcastAttackArmy(fromProvince, toProvince) {
    try {
        const message = {purpose: 'attack_army', 
            package: {fromProvince: fromProvince, toProvince: toProvince}};
        broadcastMessage(message);
    } catch (err) {
        console.log("Failed to attack with army:", err);
    }
}

async function broadcastMergeArmies(province) {
    try {
        const message = {purpose: 'merge_armies', 
            package: {province: province}};
        broadcastMessage(message);
    } catch (err) {
        console.log("Failed to move army:", err);
    }
}

async function broadcastPlayerJoined(province, sessionId) {
    try {
        console.log("Player joined game");
        const sessionDocument = await Session.find({_id: sessionId});
        const message = {
            purpose: 'player_joined', 
            package: {province: province, session: sessionDocument[0]}};
        broadcastMessage(message);
    } catch (err) {
        console.log("Failed to update province:", err);
    }
}

async function broadcastHasWon(whoWon) {
    try {
        console.log(whoWon, "won the game!");
        const message = {purpose: 'player_won', package: whoWon};
        broadcastMessage(message);
    } catch (err) {
        console.log("Failed to broadcast winner:", err);
    }
}

/**
 * @brief: Update the session for each tick
 * 
 * @param {String} id: The document id of the session 
 */
async function updateSession(id) {
    try {
        // Fetch data from database
        const provinces = await Province.find({session: id});
        const sessions = await Session.findById(id);
        const nUsers = sessions.max_slots;
        // Change value
        const userResources = mineResources(provinces, sessions.slot_names)
        for (let i = 0; i < nUsers; i++) {
            await updatePerUser(i, sessions, userResources);
        }
        // Update time
        sessions.time += 1;
        // Store and broadcast updated value
        sessions.save();
        for (let i = 0; i < provinces.length; i++) {
            provinces[i].save();
        }
        const message = {purpose: 'update_session', package: sessions};
        broadcastMessage(message);
 
        handlePendingEvents(sessions);
    } catch (err) {
        console.log("Couldnt update res:", err);
    }
}

async function handlePendingEvents(session) {
    const finishedEvents = await Pending.find({session: session._id, end: session.time});
    for (let i = 0; i < finishedEvents.length; i++) {
        const event = finishedEvents[i]; 
        switch (event.type) {
            case 'building':
                console.log("pending event: constructed building!");
                const document = await Province.findOne({_id: event.province});
                document[event.text] += 1;
                document.save();
                broadcastUpdateProvince(document);
                break;
            case 'upgrade':
                console.log("pending event: constructed building!");
                break;
            case 'move':
                console.log("pending event: constructed building!");
                break;
            case 'attack':
                console.log("pending event: constructed building!");
                break;
            default:
                console.log("pending event: wrong type!");
                break;
        }
    }
    Pending.deleteMany({session: session._id, end: session.time});
}

async function updatePerUser(slotIndex, document, userResources) {
    // Upgrades contribute to resource extraction
    const upgradeTreeId = document.upgrades[slotIndex];
    const upgradeTree   = await Upgrade.findById(upgradeTreeId);
    const modifier = 1 + 0.10 * upgradeTree.upg_tech1 + 0.10 * upgradeTree.upg_tech2 + 0.10 * upgradeTree.upg_tech3; 
    
    document.food[slotIndex]     += Math.round(userResources[slotIndex].food * modifier);
    document.fuel[slotIndex]     += Math.round(userResources[slotIndex].fuel * modifier);
    document.tools[slotIndex]    += Math.round(userResources[slotIndex].tools * modifier);
    document.material[slotIndex] += Math.round(userResources[slotIndex].material * modifier);
}

/**
 * @brief: Mine resources from resources and by building in all owned provinces
 * 
 * @param {Array} provinces: Contains the Province model of all provinces 
 * @param {Array} users: A list of all users
 * @returns A list how much resources each player earns
 */
function mineResources(provinces, users) {
    // The resources to mine per player
    userResources = [
        {'food': 0, 'fuel': 0, 'tools': 0, 'material': 0},
        {'food': 0, 'fuel': 0, 'tools': 0, 'material': 0},
        {'food': 0, 'fuel': 0, 'tools': 0, 'material': 0},
        {'food': 0, 'fuel': 0, 'tools': 0, 'material': 0}
    ];
    
    // Iterate all provinces
    for (let i = 0; i < provinces.length; i++) {
        const province = provinces[i];
        // Check the owner of a province, if no living player owns the province, skip it.
        const slot = users.findIndex( (e) => e == province.owner);
        // If no player owns the province, skip to the next one
        if (slot == -1) {
            continue;
        }
        // Add resources and drain resources from provinces when scavanging
        scavangeFood = scavangeResource(provinces, i, province.workforce, 'food');
        userResources[slot]['food'] += province.farms * 2 + scavangeFood;
        scavangeFuel = scavangeResource(provinces, i, province.workforce, 'fuel');
        userResources[slot].fuel += scavangeFuel;
        scavangeTools = scavangeResource(provinces, i, province.workforce, 'tools');
        userResources[slot].tools += province.workshops * 2 + scavangeTools;
        scavangeMaterial = scavangeResource(provinces, i, province.workforce, 'material');
        userResources[slot].material += province.mines * 2 + scavangeMaterial;
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
    const scavangeRatio = 0.05 + Math.random() * 0.05; // How much resources to scavange per manpower
    const scavangeRes = Math.round(workforce * scavangeRatio);
    const scavangeResActual = (scavangeRes > provinces[n][resource]) ? provinces[n][resource] : scavangeRes; 
    provinces[n][resource] -= scavangeResActual;
    return scavangeResActual;
}


/**
 * @brief: Broadcasts a message for all clients and include their session id 
 * 
 * @param {JSON} dataPackage: A ready to go JSON data package 
 */
function broadcastMessage(dataPackage) {
    broadcastClients.forEach(client => {
        const current = client['client'];
        const personalPackage = {... dataPackage};
        personalPackage['toSession'] = client['session'];
        const message = JSON.stringify(personalPackage);
        current.res.write(`data: ${message}\n\n`); // Send SSE message to client
    });
  }

module.exports = { 
    gameSessionStart, 
    gameSessionStop, 
    connectPlayer,
    gameSessionSetupClients, 
    broadcastUpdateProvince, 
    broadcastPlayerJoined, 
    broadcastMoveArmy,
    broadcastAttackArmy,
    broadcastHasWon,
    broadcastMergeArmies
};

