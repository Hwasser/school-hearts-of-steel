import { useState } from 'react'; 
import axios from 'axios';

import './StartMenu.css';
import startNewGame from './../../functionality/startNewGame';
import { closeGameSession } from '../../functionality/gameSessionEnded';
import { initUpgrades } from '../../upgradeStats';

export default function StartMenu( {selectLogin, onJoinGame, playerData} ){

    const worldSizes = {
        small: 9,
        medium: 16,
        large: 25
    };

    const [gameIsFull, setGameIsFull] = useState(false);
    const [allSessions, setAllSessions] = useState([]);
    const [maxSlots, setMaxSlots] = useState(2);
    const [worldSize, setWorldSize] = useState(worldSizes.small);
    const [justEntered, setJustEntered] = useState(true); // Whether we just entered this screen

    function updateSessionList() {
        // Clear "game is full" message
        setGameIsFull(false);
        // Get all sessions from the database and place them is "allSessions"
        axios
        .get('http://localhost:8082/api/sessions')
          .then((res) => {
            setAllSessions(res.data);
          })
          .catch((err) => {
            console.log('cant find: ', err.response);
          });
    }

    async function addPlayerToSession(session, freeSlots) {
        // Which array index to put player in
        const slotIndex = session.max_slots - freeSlots;
        // Update the session
        const placeholderName = session.slot_names[slotIndex]; // The name of the placeholder for the province
        session.slot_names[slotIndex] = playerData.name;
        session.slot_ids[slotIndex]   = playerData._id;
        session.purpose = 'add_player';
        // Update session
        await axios
        .put(`http://localhost:8082/api/sessions/${session._id}`, session)
          .then((res) => {
            console.log("Added player to session:", res.data);
          })
          .catch((err) => {
            console.log('Failed adding player to session:', err.response);
          });
        // Update empty slot in province
        const provinceData = {
            oldName: placeholderName, 
            newName: playerData.name, 
            sessionId: session._id,
            purpose: 'replace_empty_slot'};
        await axios
        .put("http://localhost:8082/api/provinces", provinceData)
          .catch((err) => {
            console.log('StartMenu: Failed updating empty slot: ', err.response);
          });
    }

    async function handleJoinGame(selectedSession, freeSlots) {
        // Check whether the player already is in the session
        const playerJoined = selectedSession.slot_names.reduce(
            (acc, cur) => (cur == playerData.name) ? acc + 1 : acc, 0
            );

        if (playerJoined) {
            // Get the player slot
            const playerSlot = selectedSession['slot_names'].findIndex( (e) => e == playerData.name);
            // Get the current upgrade tree of the player
            const upgradeTree = await getUpgradeTree(selectedSession.upgrades[playerSlot]);
            // Start game
            onJoinGame(selectedSession, upgradeTree, playerSlot);
        } else {
            // Otherwise check if we can add the player to the session
            if (freeSlots > 0) {
                await addPlayerToSession(selectedSession, freeSlots);
                // Get the player slot
                const playerSlot = selectedSession['slot_names'].findIndex( (e) => e == playerData.name);
                // Get the current upgrade tree of the player
                const upgradeTree = await getUpgradeTree(selectedSession.upgrades[playerSlot]);
                // Start game
                onJoinGame(selectedSession, upgradeTree, playerSlot);
            } else {
                setGameIsFull(true);
            }
        }
    }

    function handleCloseGameSession(id){
        closeGameSession(id);
        setTimeout(() => updateSessionList(), 250);
    };

    // Get a list of the view of all games in the session list
    function GetSessionList() {
        const worldSizesReversed = {
            9: 'small',
            16: 'medium',
            25: 'large'
        };
        const allSessionsView = []
            for (let i = 0; i < allSessions.length; i++) {
                // Get free slots
                const curFreeSlots = allSessions[i].slot_ids.reduce(
                    (acc, cur) => (cur == null) ? acc + 1 : acc, 0
                );
                const curMaxSlots = allSessions[i].max_slots;
                const curTakenSlots = curMaxSlots - curFreeSlots;
                const curSize = worldSizesReversed[allSessions[i].world_size];
                const isOwner = allSessions[i].creator == playerData._id;

                allSessionsView.push(
                    <li key={'game' + i} className="join_game_entry"> <button className='join_game_button'
                        onClick={() => handleJoinGame(allSessions[i], curFreeSlots)}> Game: {i} | size: {curSize} | slots: ({curTakenSlots + "/" + curMaxSlots}) 
                    </button> 
                    {isOwner && (
                        <button className="join_game_entry_close" onClick={() => handleCloseGameSession(allSessions[i])}>x</button>
                    )}
                    </li>
                );
            }
        return allSessionsView;
    }

    // Init a new session with the starter players name and _id and
    // starting resources. Then it goes on to fill up with dummies.
    function initSession(upgradeTrees) {
        const newSession = {
            creator: playerData._id,
            max_slots: maxSlots,
            slot_names: [playerData.name],
            slot_ids: [playerData._id],
            upgrades: [upgradeTrees[0]],
            world_size: worldSize,
            time: 0,
            food: [10000],
            fuel: [10000],
            material: [10000],
            tools: [10000]
        }
        for (let i = 1; i < maxSlots; i++) {
            const nextPlayer = "Player" + (i+1);
            newSession.slot_names.push(nextPlayer);
            newSession.slot_ids.push(null);
            newSession.upgrades.push(upgradeTrees[i]);
            newSession.food.push(100);
            newSession.fuel.push(100);
            newSession.material.push(100);
            newSession.tools.push(100);
        }
        return newSession;
    }

    async function handleStartGame() {
        // Add a upgrade tree for each player
        const upgradeTrees = await addUpgrades(maxSlots);
        // Setup a new session
        const newSession = initSession(upgradeTrees);
        // Post new sessions
        await axios
        .post('http://localhost:8082/api/sessions', newSession)
          .then((res) => {
            console.log("Created new game!", res)
            // Refresh game list
            updateSessionList();
            try {
                startNewGame(res.data.session);
            } catch(err) {
                console.log("Error with startNewGame:", err);
            }
          })
          .catch((err) => {
            console.log('cant find: ', err.response);
          });
        // Clear "game is full" message
        setGameIsFull(false);
    }

    if (justEntered) {
        updateSessionList();
        setJustEntered(false)
    }

    return(
        <>
        <div className='start_container'>
            <h2 className='welcome_text'>Welcome in {playerData.name}</h2>

            <div className='start_body_container'>
                <div className='start_game_container'>
                    <h3>Create a new game</h3>
                    <p className='start_text_options'>Max number of players:</p>
                    <div className='game_option_container'>
                        <button className={(maxSlots == 2 ? 'startmenu_button_selected' : 'startmenu_button')} 
                            onClick={() => setMaxSlots(2)} >2</button>
                        <button className={(maxSlots == 3 ? 'startmenu_button_selected' : 'startmenu_button')} 
                            onClick={() => setMaxSlots(3)} >3</button>
                        <button className={(maxSlots == 4 ? 'startmenu_button_selected' : 'startmenu_button')} 
                            onClick={() => setMaxSlots(4)} >4</button>

                    </div>

                    <p className='start_text_options'>World size:</p>
                    <div className='game_option_container'>
                        <button className={(worldSize == worldSizes.small ? 'startmenu_button_selected' : 'startmenu_button')} 
                            onClick={() => setWorldSize(worldSizes.small)} >Small</button>
                        <button className={(worldSize == worldSizes.medium ? 'startmenu_button_selected' : 'startmenu_button')} 
                            onClick={() => setWorldSize(worldSizes.medium)} >Medium</button>
                        <button className={(worldSize == worldSizes.large ? 'startmenu_button_selected' : 'startmenu_button')}
                            onClick={() => setWorldSize(worldSizes.large)} >Large</button>

                    </div>
                    
                    <button id="create_new_game_button" className='startmenu_button' onClick={handleStartGame}>Create new game</button>
                </div>
                <div className='game_list_container'>
                    <h3>Join a game</h3>
                    <ul>
                        <GetSessionList />
                    </ul>
                    <button id='start_menu_refresh_button' onClick={() => updateSessionList()}>Refresh list</button>
                </div>
            </div>
            {gameIsFull && (
                <p className='game_session_is_full'>That game session is full!</p>
            )}
            <button className='startmenu_button' onClick={selectLogin}>Log out</button>
        </div>
        </>
    );
}

async function addUpgrades(maxSlots) {
    const upgradeTrees = [];
    for (let i = 0; i < maxSlots; i++) {
        await axios
            .post(`http://localhost:8082/api/upgrades/`, initUpgrades)
            .then((res) => {
                upgradeTrees.push(res.data.upgrades._id);
            })
            .catch((err) => {
            console.log('Failed adding upgrade tree to session:', err.response);
            });
    }
    return upgradeTrees;
}

async function getUpgradeTree(upgradeId) {
    let upgradeTree = {};
    await axios
    .get(`http://localhost:8082/api/upgrades/${upgradeId}`)
        .then((res) => {
        upgradeTree = res.data;
        })
        .catch((err) => {
        console.log('Failed adding player to session:', err.response);
    });
    return upgradeTree;

}

// TODO: Temporary!
async function removeAllSessions() {
    // Remove all previous sessions TODO: Temporary
    await axios
        .delete('http://localhost:8082/api/sessions')
        .then( () => {
        })
        .catch((err) => {
            console.log('cant remove all sessions:', err);
    });
}

// TODO: Temporary!
async function removeAllProvinces() {
    await axios
        .delete('http://localhost:8082/api/provinces')
        .then( () => {
        })
        .catch((err) => {
            console.log('cant remove all provinces:', err);
    });
}

// TODO: Temporary!
async function removeAllArmies() {
    await axios
        .delete('http://localhost:8082/api/armies')
        .then( () => {
        })
        .catch((err) => {
            console.log('cant remove all armies:', err);
    });
}

// TODO: Temporary!
async function removeAllUpgrades() {
    await axios
        .delete('http://localhost:8082/api/upgrades')
        .then( () => {
        })
        .catch((err) => {
            console.log('cant remove all upgrades:', err);
    });
}
