import axios from 'axios';

/**
 * @brief: Post a pending action for constructing a building
 * 
 * @param {JSON} province 
 * @param {JSON} session 
 * @param {JSON} player 
 * @param {String} building 
 */
export function postBuilding(province, session, player, building) {
    const pendingAction = {
        type: 'building',
        session: session._id,
        player: player._id, 
        start: session.time,
        end: session.time + 5,
        provinceID: province._id,
        provinceN: province._id,
        text: building + 's'
    }
    // Post to server
    axios
    .post(`http://localhost:8082/api/pendings/`, pendingAction)
    .catch((err) => {
    console.log('Error with posting pending actions!: ' + err);
    });
}

/**
 * @brief: Post a pending action for moving an army
 * 
 * @param {JSON} fromProvince
 * @param {JSON} toProvince 
 * @param {JSON} session 
 * @param {JSON} player 
 * @param {String} army: Document id of an army
 */
export function postMovement(fromProvinceID, toProvinceID, fromProvinceN, toProvinceN, session, player, army, pushPendingData) {
    const movementTime = 3;
    const pendingAction = {
        type: 'movement',
        session: session._id,
        player: player._id, 
        start: session.time,
        end: session.time + movementTime,
        provinceID: fromProvinceID,
        province2ID: toProvinceID,
        provinceN: fromProvinceN,
        province2N: toProvinceN,
        army_id: army
    }
    // Push to UI before being posted to make UI seem more snappy
    pushPendingData(pendingAction);
    // Post to server
    axios
    .post(`http://localhost:8082/api/pendings/`, pendingAction)
    .catch((err) => {
    console.log('Error with posting pending actions!: ' + err);
    });
}