/**
 * Module contains functions that are going to be broadcasted from the server to all clients
 */

const Session = require('./models/Session');
const Province = require('./models/Province');
const Pending = require('./models/Pending');

const {
    attackOrMoveArmy
  } = require('./queryfunctions');
const {
    broadcastMessage,
    broadcastUpdateProvince
} = require('./broadcast');

const gameSessions = {};
const timePerUpdate = 5000;

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
        try {
            switch (event.type) {
                case 'building':
                    console.log("pending event: constructed building!");
                    const document = await Province.findOne({_id: event.province});
                    document[event.text] += 1;
                    document.save();
                    broadcastUpdateProvince(document);
                    break;
                case 'upgrade':
                    console.log("pending event: completed upgrade!");
                    break;
                case 'movement':
                    console.log("pending event: completed movement!");
                    try {
                        attackOrMoveArmy(event);
                    } catch (err) {
                        console.log("Failed to move unit due to:", err);
                    }
                    break;
                case 'battle':
                    console.log("pending event: performing battle!");
                    break;
                default:
                    console.log("pending event: wrong type!");
                    break;
            }
        } catch (err) {
            console.log("Error with event:", err);
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


module.exports = { 
    gameSessionStart, 
    gameSessionStop
};

