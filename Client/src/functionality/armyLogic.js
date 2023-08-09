
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