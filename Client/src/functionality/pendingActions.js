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
        province: province._id,
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
export function postMovement(fromProvince, toProvince, session, player, army) {
    const pendingAction = {
        type: 'movement',
        session: session._id,
        player: player._id, 
        start: session.time,
        end: session.time + 3,
        province: fromProvince,
        province2: toProvince,
        army_id: army
    }
    // Post to server
    axios
    .post(`http://localhost:8082/api/pendings/`, pendingAction)
    .catch((err) => {
    console.log('Error with posting pending actions!: ' + err);
    });
}