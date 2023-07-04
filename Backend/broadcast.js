//const { broadcastMessage } = require('./app')
const Session = require('./models/Session');

const gameSessions = [];
const timePerUpdate = 5000;
let broadcastClients = [];

function gameSessionStart(id) {
    try {
        Console.log("broadcast: started game session", id);
        // A loop for updating resources for all users
        const sessionLoop = setInterval(() => {
            updateResuources(id);
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

// Function to send SSE messages to all clients
function broadcastMessage(message) {
    clients.forEach(client => {
      client.res.write(`data: ${message}\n\n`); // Send SSE message to client
    });
  }

async function updateResuources(id) {
    const document = await Session.findById(id);
    // Change value
    for (let i = 0; i < document.max_slots; i++) {
        updatePerUser(i, document);
    }
    // Store and broadcast updated value
    const message = JSON.stringify(document);
    broadcastMessage(message);
    await document.save();
}

// TODO: Do correct updates per user depending on provinces
function updatePerUser(slotIndex, document) {
    document.food[slotIndex]     += 10;
    document.fuel[slotIndex]     += 10;
    document.tools[slotIndex]    += 10;
    document.material[slotIndex] += 10;
}

module.exports = { gameSessionStart, gameSessionStop, gameSessionSetupClients };

