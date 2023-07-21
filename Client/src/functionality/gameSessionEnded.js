import axios from 'axios';

/**
 * When a game session ends. Either by the game being closed down by a user or by someone winning
 */

/**
 * @brief: A game ended naturally by someone winning.
 * 
 * @param {JSON} session: The current game session
 */
export function gameEndedNaturally(session) {
    const allUpgradeTrees = session.upgrades;
    for (let i = 0; i < allUpgradeTrees.length; i++) {
        removeUpgradeTree(allUpgradeTrees[i]);
    }
    removeProvinces(session._id);
    removeSession(session._id);
}


function removeUpgradeTree(id) {
    axios
    .delete(`http://localhost:8082/api/upgrades/${id}`)
    .catch((err) => {
        console.log('Failed removing a upgrade tree:', err.response);
    });
}

function removeSession(id) {
    axios
    .delete(`http://localhost:8082/api/sessions/${id}`)
    .catch((err) => {
        console.log('Failed removing a session:', err.response);
    });
}

function removeProvinces(id) {
    axios
    .delete(`http://localhost:8082/api/provinces/`, {purpose: 'remove_session', id: id})
    .catch((err) => {
        console.log('Failed removing a session:', err.response);
    });
}