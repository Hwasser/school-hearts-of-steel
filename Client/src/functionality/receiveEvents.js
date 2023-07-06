export function receiveResourceUpdate(dataPackage, updatedSession, slotIndex) {
    try {
        updatedSession.food[slotIndex]     = dataPackage.food[slotIndex];
        updatedSession.fuel[slotIndex]     = dataPackage.fuel[slotIndex];
        updatedSession.tools[slotIndex]    = dataPackage.tools[slotIndex];
        updatedSession.material[slotIndex] = dataPackage.material[slotIndex];
    } catch (err) {
        console.log("Broken because:", err);
    }
    return updatedSession;
}

export function receiveMoveArmy(dataPackage, armiesCopy) {
    const fromProvince = dataPackage.fromProvince;
    const toProvince   = dataPackage.toProvince;
    // Put new values into copy
    armiesCopy[0][fromProvince.id] = fromProvince['army1'];
    armiesCopy[1][fromProvince.id] = fromProvince['army2'];
    armiesCopy[2][fromProvince.id] = fromProvince['army3'];
    armiesCopy[3][fromProvince.id] = fromProvince['army4'];
    armiesCopy[0][toProvince.id] = toProvince['army1'];
    armiesCopy[1][toProvince.id] = toProvince['army2'];
    armiesCopy[2][toProvince.id] = toProvince['army3'];
    armiesCopy[3][toProvince.id] = toProvince['army4'];
    return armiesCopy
}

export function receiveAttackArmy(dataPackage, armiesCopy, ownersCopy) {
    const fromProvince = dataPackage.fromProvince;
    const toProvince   = dataPackage.toProvince;
    // Put new values into copy
    armiesCopy[0][fromProvince.id] = fromProvince['army1'];
    armiesCopy[1][fromProvince.id] = fromProvince['army2'];
    armiesCopy[2][fromProvince.id] = fromProvince['army3'];
    armiesCopy[3][fromProvince.id] = fromProvince['army4'];
    armiesCopy[0][toProvince.id] = toProvince['army1'];
    armiesCopy[1][toProvince.id] = toProvince['army2'];
    armiesCopy[2][toProvince.id] = toProvince['army3'];
    armiesCopy[3][toProvince.id] = toProvince['army4'];
    ownersCopy[toProvince.id] = toProvince['owner'];

    return {armies: armiesCopy, owners: ownersCopy};
}

export function receiveJoinedPlayer() {
    
}

export function receiveUpdateProvince() {

}