const express = require('express');
const Session = require('./models/Session');

const gameSessionLoops = {};

async function gameSessionStart(id) {
    const updateResourceLoop = setInterval(() => updateResource(id));
    gameSessionLoops[id] = updateResourceInterval;
    console.log("gameSession: Started game session", id);
}

// Remove all sessions from now - NOTE: Only one session in list
async function gameSessionClose(ids) {
    const id = ids[0];

    clearInterval(gameSessionLoops[id]);
    delete gameSessionLoops.id;
    console.log("gameSession: Closed game session", id);
}

async function updateResource(id) {
    const document = await Session.findById(id)
    // Change value
    const numPlayers = document.max_slots;
    for(let i = 0; i < numPlayers; i++) {
        updateResourceForPlayer(i, document)
    }
    // Store value and show status
    await document.save();
}

function updateResourceForPlayer(slot, session) {
        session.food[slot]     += 10;
        session.fuel[slot]     += 10;
        session.tools[slot]    += 10;
        session.material[slot] += 10;
}
