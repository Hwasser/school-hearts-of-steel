import axios from 'axios';

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

export function postMovement(fromProvince, toProvince, session, player, army) {
    const pendingAction = {
        type: 'movement',
        session: session._id,
        player: player._id, 
        start: session.time,
        end: session.time + 3,
        province: fromProvince._id,
        province2: toProvince._id,
        army_id: army
    }
    // Post to server
    axios
    .post(`http://localhost:8082/api/pendings/`, pendingAction)
    .catch((err) => {
    console.log('Error with posting pending actions!: ' + err);
    });
}