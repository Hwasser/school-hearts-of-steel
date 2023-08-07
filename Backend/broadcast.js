/**
 * Module contains functions that are going to be broadcasted from the server to all clients
 */

const Session = require('./models/Session');
const Province = require('./models/Province');
const Pending = require('./models/Pending');

let broadcastClients = [];

/**
 * @brief: Connect a EventSource-client to a connected player id and session id
 * 
 * @param {String} token: A String generated from the date is ms when the player joined
 * @param {String} session: A session _id
 * @param {String} player: A player _id 
 */
function connectPlayer(token, session, player) {
    let clientToRemove = null;
    broadcastClients.forEach(client => {
        // If old client is tied to the same player, remove it
        broadcastClients = broadcastClients.filter(e => e['player'] != player)
        // Tie client to a player and a session
        if (client['token'] == token) {
            client['session'] = session;
            client['player'] = player;
        }
    });
    
    removeDeadClients();
}

function gameSessionSetupClients(clients) {
    broadcastClients = clients;
}


/**
 * @brief: Remove clients that belongs to a removed game session
*/
async function removeDeadClients() {
    const allSessions = await Session.find({});
    const sessionIds = allSessions.map(e => e._id.toString());
    broadcastClients = broadcastClients.filter(e => sessionIds.includes(e.session))
    console.log("All clients:", broadcastClients);
}

async function broadcastUpdateProvince(province) {
    try {
        const message = {purpose: 'update_province', package: province};
        broadcastMessage(message, province.session);
    } catch (err) {
        console.log("Failed to update province:", err);
    }
}

/**
 * @brief: Broadcast the changes that has been done to provinces regarding armies and battles
 * 
 * @param {String} sessionId 
 */
async function broadcastUpdateEvents(sessionId) {
    const provinces = await Province.find({session: sessionId});
    provinceUpdates = {};
    // Pick up data regarding updated armies and buildings
    for (let i = 0; i < provinces.length; i++) {
        const provinceId = provinces[i]._id;
        provinceUpdates[provinceId] = {
            id: provinces[i].id,
            armies: provinces[i].armies,
            enemy_army: provinces[i].enemy_army,
            owner: provinces[i].owner,
            houses: provinces[i].houses,
            farms: provinces[i].farms,
            mines: provinces[i].mines,
            forts: provinces[i].forts,
            workshops: provinces[i].workshops
        };
    }
    // Package and send
    const message = {
        purpose: 'update_armies',
        package: provinceUpdates
    };
    broadcastMessage(message, sessionId);
}

// Broadcast current state of a battle
async function broadcastAttackBattle(province, soldiers1, soldiers2, performance, sessionId) {
    try {
        const message = 
            {purpose: 'attack_battle', 
                package: {
                    province: province,
                    soldiers1: soldiers1,
                    soldiers2: soldiers2,
                    performance: performance
            }
        };
        broadcastMessage(message, sessionId);
    } catch (err) {
        console.log("Failed to attack with army:", err);
    }
}

async function broadcastMergeArmies(province, sessionId) {
    try {
        const message = {purpose: 'merge_armies', 
            package: {province: province}};
        broadcastMessage(message, sessionId);
    } catch (err) {
        console.log("Failed to move army:", err);
    }
}

async function broadcastPlayerJoined(province, sessionId) {
    try {
        console.log("Player joined game");
        const sessionDocument = await Session.findOne({_id: sessionId});
        const message = {
            purpose: 'player_joined', 
            package: {province: province, session: sessionDocument}};
        broadcastMessage(message, sessionId);
    } catch (err) {
        console.log("Failed to update province:", err);
    }
}

async function broadcastHasWon(whoWon, sessionId) {
    try {
        console.log(whoWon, "won the game!");
        const message = {purpose: 'player_won', package: whoWon};
        broadcastMessage(message, sessionId);
    } catch (err) {
        console.log("Failed to broadcast winner:", err);
    }
}

/**
 * @brief: Broadcasts a message for all clients and include their session id 
 * 
 * @param {JSON} dataPackage: A ready to go JSON data package 
 */
function broadcastMessage(dataPackage, sessionId) {
    const session = (typeof(sessionId) == "string") ? sessionId : sessionId.toString();

    broadcastClients.forEach(client => {
        if (client['session'] != null && client['session'] == session) {
            // Tie each package to the session and player the client is tied to 
            const current = client['client'];
            const personalPackage = {... dataPackage};
            personalPackage['toSession'] = session;
            personalPackage['toPlayer'] = client['player'];
            const message = JSON.stringify(personalPackage);
            current.res.write(`data: ${message}\n\n`); // Send SSE message to client
        }
    });
  }

module.exports = {  
    connectPlayer,
    gameSessionSetupClients, 
    broadcastUpdateProvince, 
    broadcastPlayerJoined, 
    broadcastUpdateEvents,
    broadcastAttackBattle,
    broadcastHasWon,
    broadcastMergeArmies,
    broadcastMessage
};

