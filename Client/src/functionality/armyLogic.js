/**
 * This module contains larger army logics, such as moving and splitting
 * an army. 
 */

import axios from 'axios';
import {host} from '../backend_adress';

/**
 * @brief: Setup a movement event after dragging an army on the screen
 * NOTE: Called from "GameUI"
 * 
 * @param {Integer} fromProvince: Province number 
 * @param {Integer} toProvince: Province number 
 * @param {JSON} army: The object id (_id) of an army
 * @param {Integer} fromSlot: Which slot the army came from
 * @param {[Integer]} provinceID: React state
 * @param {[[Integer]]} armies: React state, each army in every army and slot
 * @param {Integer} worldRowSize: The size of each row of provinces on the screen
 * @param {Function} pushMovement
 */
export function setupMovement(fromProvince, toProvince, army, fromSlot, provinceId, armies, worldRowSize, owners, pushMovements) {
    // Check if destination province is neightbour from this province
    const move = fromProvince - toProvince; 
    if (Math.abs(move) == worldRowSize 
      || (move === -1 &&  (fromProvince % worldRowSize !== worldRowSize-1))
      || (move === 1 && (fromProvince % worldRowSize !== 0) || move === 0) ) {    
        // Check if the destination province is ours or belongs to another player
        if (owners[toProvince] == owners[fromProvince]) {
            // Only start moving an army if there are any available army slots in dst!
            if (armies[0][toProvince] == null 
            || armies[1][toProvince] == null 
            || armies[2][toProvince] == null 
            || armies[3][toProvince] == null) {      
            console.log("move army " + army + " from province " + fromProvince + " to " + toProvince);
            const pendingEventPackage = createPendingMovementPackage(fromProvince, toProvince, provinceId, army);
            pushMovements(army, fromProvince, toProvince, fromSlot, pendingEventPackage);
            } else {
            console.log("No available army slots in that province!");
            }
        // If the province is not ours, attack!
        } else {
            console.log("attack with army " + army + " from province " + fromProvince + " to " + toProvince);
            const pendingEventPackage = createPendingMovementPackage(fromProvince, toProvince, provinceId, army);
            pushMovements(army, fromProvince, toProvince, fromSlot, pendingEventPackage);
        }
    } else {
    console.log("Province is too far away!");
    }
}

/**
 * @brief: Creates an event package for the server
 * 
 * @param {String} fromProvince: Province number
 * @param {String} toProvince: Province number
 * @param {[String]} provinceId: All province Ids
 * @param {String} army: Army id
 * @returns {Dict} An event package that gets posted to the server later
 */
function createPendingMovementPackage(fromProvince, toProvince, provinceId, army) {
    const province1 = provinceId[fromProvince];
    const province2 = provinceId[toProvince];
    // Event package to send to server
    const pendingEventPackage = {
        type: "movement",
        provinceID: province1,
        province2ID: province2,
        provinceN: fromProvince,
        province2N: toProvince,
        army_id: army
    }
    return pendingEventPackage;
}

/**
 * @brief: An army has been divided into a left and right part.
 *         The left army is the original one and will be replaced
 *         in the DB and the right army will be created and pushed
 *         to the DB. Then the new left army will be selected.
 * Note: handleSelectAction is called from "Game.js"
 * 
 * @param {String} leftArmy 
 * @param {String} rightArmy 
 * @param {String} leftArmyId 
 * @param {JSON} province 
 * @param {[String]} provinceOwners 
 * @param {[[String]]} armies 
 * @param {String} sessionId 
 * @param {Function} handleSelectAction 
 */
export async function splitArmy(leftArmy, rightArmy, leftArmyId, province, provinceOwners, armies, sessionId, handleSelectAction) {
    const maxArmySlots = 4;
    // Add information to armies
    leftArmy['session'] = sessionId;
    leftArmy['owner']   = provinceOwners[province];
    rightArmy['session'] = sessionId;
    rightArmy['owner']   = provinceOwners[province];
    // Post changes to left army
    let newLeftId  = "";
    await axios
    .put(host + `/api/armies/${leftArmyId}`, leftArmy)
    .then((res) => {
        newLeftId = res.data.armydata._id;
        handleSelectAction(res.data.armydata);
    })
    .catch((err) => {
        console.log('Error in updating army: ' + err);
    });
    // Post new right army
    let newRightId = "";
    await axios
        .post(host + '/api/armies/', rightArmy)
        .then((res) => {newRightId = res.data.armydata._id})
        .catch((err) => {
            console.log('Error in posting army: ' + err);
    });
    // Re-order the slots with the new armies
    const newProvinceSlots = [];
    for (let i = 0; i < maxArmySlots; i++) {
        if (armies[i][province] != leftArmyId && armies[i][province] != null) {
            newProvinceSlots.push(armies[i][province]);
        }
    }
    newProvinceSlots.push(newLeftId);
    newProvinceSlots.push(newRightId);
    // Post changes of province
    const postPackage = {
        purpose: 'update_province_armies',
        armySlots: newProvinceSlots,
        provinceN: province,
        session: sessionId
    };
    axios
        .put(host + '/api/provinces', postPackage)
        .catch((err) => {
        console.log('Error in replacing armies in province: ' + err);
    });
}