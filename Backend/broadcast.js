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

/**
 * @brief: Broadcast the changes that has been done to provinces regarding armies and battles
 * 
 * @param {String} sessionId 
 */
async function broadcastUpdateArmies(sessionId) {
    const provinces = await Province.find({session: sessionId});
    provinceUpdates = {};
    // Pick up armies-list, enemy_army and owner of each province
    for (let i = 0; i < provinces.length; i++) {
        const provinceId = provinces[i]._id;
        provinceUpdates[provinceId] = {
            id: provinces[i].id,
            armies: provinces[i].armies,
            enemy_army: provinces[i].enemy_army,
            owner: provinces[i].owner
        };
    }
    // Package and send
    const message = {
        purpose: 'update_armies',
        package: provinceUpdates
    };
    broadcastMessage(message);
}

// Broadcast current state of a battle
async function broadcastAttackBattle(province, soldiers1, soldiers2, performance) {
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
    connectPlayer,
    gameSessionSetupClients, 
    broadcastUpdateProvince, 
    broadcastPlayerJoined, 
    broadcastUpdateArmies,
    broadcastAttackBattle,
    broadcastHasWon,
    broadcastMergeArmies,
    broadcastMessage
};

