import { useState } from 'react'; 
import axios from 'axios';

import './StartMenu.css';
import startNewGame from './../../functionality/startNewGame';

export default function StartMenu( {selectLogin, onJoinGame, playerData} ){

    const [allSessions, setAllSessions] = useState([]);
    const [maxSlots, setMaxSlots] = useState(2);

    function getAllSessions() {
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
        // Put player data in the session
        //session.slot_names[slotIndex] = playerData.name;
        //session.slot_ids[slotIndex]   = playerData._id;
        //const id = session._id;
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
            // Start game
            onJoinGame(selectedSession);
        } else {
            // Otherwise check if we can add the player to the session
            if (freeSlots > 0) {
                await addPlayerToSession(selectedSession, freeSlots);
                // Start game
                onJoinGame(selectedSession);
            } else {
                console.log("This game session is full!");
                // TODO: IMPLEMENT AN ERROR MESSAGE FOR THE PLAYER!
            }
        }
    }

    // Get a list of the view of all games in the session list
    function GetSessionList() {
        const allSessionsView = []
            for (let i = 0; i < allSessions.length; i++) {
                // Get free slots
                const curFreeSlots = allSessions[i].slot_ids.reduce(
                    (acc, cur) => (cur == null) ? acc + 1 : acc, 0
                );
                const curMaxSlots = allSessions[i].max_slots;
                const curTakenSlots = curMaxSlots - curFreeSlots;

                allSessionsView.push(
                    <li key={'game' + i} className="join_game_entry"> <button className='startmenu_button'
                        onClick={() => handleJoinGame(allSessions[i], curFreeSlots)}> Game ({curTakenSlots + "/" + curMaxSlots}) 
                    </button> </li>
                );
            }
        return allSessionsView;
    }

    // Init a new session with the starter players name and _id and
    // starting resources. Then it goes on to fill up with dummies.
    function initSession() {
        const newSession = {
            max_slots: maxSlots,
            slot_names: [playerData.name],
            slot_ids: [playerData._id],
            food: [100],
            fuel: [100],
            material: [100],
            tools: [100]
        }
        for (let i = 1; i < maxSlots; i++) {
            const nextPlayer = "Player" + (i+1);
            newSession.slot_names.push(nextPlayer);
            newSession.slot_ids.push(null);
            newSession.food.push(100);
            newSession.fuel.push(100);
            newSession.material.push(100);
            newSession.tools.push(100);
        }
        return newSession;
    }

    async function handleStartGame() {
        // Setup a new session
        const newSession = initSession();

        // Remove all previous sessions
        await axios
        .delete('http://localhost:8082/api/sessions')
        .then( () => {
        })
        .catch((err) => {
            console.log('cant remove all sessions:', err);
        });
        // Post new sessions
        await axios
        .post('http://localhost:8082/api/sessions', newSession)
          .then((res) => {
            console.log("Created new game!")
            // Refresh game list
            getAllSessions();
            startNewGame(newSession);
          })
          .catch((err) => {
            console.log('cant find: ', err.response);
          });
    }

    if (allSessions.length == 0) {
        getAllSessions();
    }

    return(
        <>
        <div className='start_container'>
            <h2 className='welcome_text'>Welcome in {playerData.name}</h2>
            <div className='start_game_container'>
                <h3>Create a new game</h3>
                <p>Max number of players:</p>
                <div className='select_slot_container'>
                    <button className='startmenu_button' onClick={() => setMaxSlots(2)} >2</button>
                    <button className='startmenu_button' onClick={() => setMaxSlots(3)} >3</button>
                    <button className='startmenu_button' onClick={() => setMaxSlots(4)} >4</button>

                </div>
                
                 
                <button className='startmenu_button' onClick={handleStartGame}>Create new game</button>
            </div>
            <div className='game_list_container'>
            <h3>Join a game</h3>
            <ul>
                <GetSessionList />
            </ul>
            </div>
            <button className='startmenu_button' onClick={selectLogin}>Log out</button>
        </div>
        </>
    );
}