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

async function broadcastMoveArmy(fromProvince, toProvince) {
    try {
        const message = {purpose: 'move_army', 
            package: {fromProvince: fromProvince, toProvince: toProvince}};
        broadcastMessage(message);
    } catch (err) {
        console.log("Failed to move army:", err);
    }
}

async function broadcastAttackWin(fromProvince, toProvince) {
    try {
        const message = {purpose: 'attack_win', 
            package: {fromProvince: fromProvince, toProvince: toProvince}};
        broadcastMessage(message);
    } catch (err) {
        console.log("Failed to attack with army:", err);
    }
}

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
    broadcastMoveArmy,
    broadcastAttackWin,
    broadcastAttackBattle,
    broadcastHasWon,
    broadcastMergeArmies,
    broadcastMessage
};

