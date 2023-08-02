import axios from 'axios';
import {host} from '../backend_adress';

/**
 * When a game session ends. Either by the game being closed down by a user or by someone winning
 */

/**
 * @brief: A game ended naturally by someone winning.
 * 
 * @param {JSON} session: The current game session
 */
export function closeGameSession(session) {
    const allUpgradeTrees = session.upgrades;
    for (let i = 0; i < allUpgradeTrees.length; i++) {
        removeUpgradeTree(allUpgradeTrees[i]);
    }
    removeProvinces(session._id);
    removeSession(session._id);
}


function removeUpgradeTree(id) {
    axios
    .delete(host + `/api/upgrades/${id}`)
    .catch((err) => {
        console.log('Failed removing a upgrade tree:', err.response);
    });
}

function removeSession(id) {
    axios
    .delete(host + `/api/sessions/${id}`)
    .catch((err) => {
        console.log('Failed removing a session:', err.response);
    });
}

function removeProvinces(id) {
    axios.delete(host + `/api/provinces`, {
        params: {
          id: id,
          purpose: 'remove_session' 
        }
      })
    .catch((err) => {
        console.log('Failed removing a session:', err.response);
    });
}