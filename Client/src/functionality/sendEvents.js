import axios from 'axios';
import {host} from '../backend_adress';

const { buildings } = require('../GameData/provinceStats');

/**
 * @brief: Post a pending action
 * 
 * @param {JSON} event
 * @param {[JSON]} pending
 * @param {Function} getPendingData
 * @param {Function} fetchResourceUpdates
 * @param {Integer} slotIndex
 */
export async function sendEvent(event, pending, getPendingData, fetchResourceUpdates, slotIndex) {
    if (event.type == 'building') {
        await postBuilding(event, pending, getPendingData, fetchResourceUpdates, slotIndex);
    }
    if (event.type == 'movement') {
        await postMovement(event);
    }
}

/**
 * @brief: Post a pending action for constructing a building
 * 
 * @param {JSON} event
 * @param {[JSON]} pending
 * @param {Function} getPendingData
 * @param {Function} fetchResourceUpdates
 * @param {Integer} slotIndex
 */
async function postBuilding(event, pending, getPendingData, fetchResourceUpdates, slotIndex) {
    // Check if we're already buying a building
    let alreadyBought = null;
    for (let i = 0; i < pending.length; i++) {
        if (pending[i].type == 'building' && pending[i].provinceN == event.provinceN) {
            alreadyBought = pending[i];
            break;
        }
    }
    
    const curCost = {
        food: buildings[event.text]['food'],
        fuel: buildings[event.text]['fuel'],
        tools: buildings[event.text]['tools'],
        material: buildings[event.text]['material']
    };
    
    if (alreadyBought != null) {
        // If building is of other type -> abort
        if (alreadyBought.text != event.text) {
            return;
        }
        // If building is of the same type, cancel the construction of that building
        // and return the resources!
        curCost.food *= -1;
        curCost.fuel *= -1;
        curCost.material *= -1;  
        curCost.tools *= -1;
        await updateSession(curCost, slotIndex, event.session);
        // Post to server
        await axios
        .delete(host + `/api/pendings/${alreadyBought._id}`)
        .catch((err) => {
        console.log('Error with posting pending actions!: ' + err);
        });
    } else {
        await updateSession(curCost, slotIndex, event.session);
        // Post to server
        await axios
        .post(host + '/api/pendings/', event)
        .catch((err) => {
        console.log('Error with posting pending actions!: ' + err);
        });
    }
    // re-get pending data from db and fetch resource updates!
    getPendingData();
    fetchResourceUpdates();
}

/**
 * @brief: Post a pending action for moving an army
 * 
 * @param {JSON} event
 */
async function postMovement(event) {
    // Post to server
    await axios
    .post(host + '/api/pendings/', event)
    .catch((err) => {
        console.log('Error with posting pending actions!: ' + err);
    });
}

// Update the player resources in the session
async function updateSession(curCost, slotIndex, sessionId) {
    // A package with data to send to the backend
    const updatePackage = {
        food: curCost['food'],
        fuel: curCost['fuel'],
        tools: curCost['tools'],
        material: curCost['material'],
        purpose: 'buy_stuff',
        slotIndex: slotIndex,
    };

    await axios
    .put(host + `/api/sessions/${sessionId}`, updatePackage)
    .catch((err) => {
        console.log('Couldnt update the session: ' + err);
    });  
}