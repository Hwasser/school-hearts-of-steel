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
