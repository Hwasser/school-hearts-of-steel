import { useState } from 'react'; 
import axios from 'axios';

import './StartMenu.css';
import startNewGame from './../functionality/startNewGame';

export default function StartMenu( {selectLogin, startGameAction, playerData} ){

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

    function addPlayerToSession(session, freeSlots) {
        // Which array index to put player in
        const slotIndex = session.max_slots - freeSlots;
        // Put player data in the session
        //session.slot_names[slotIndex] = playerData.name;
        //session.slot_ids[slotIndex]   = playerData._id;
        //const id = session._id;
        // Update the session
        session.slot_names[slotIndex] = playerData.name;
        session.slot_ids[slotIndex]   = playerData._id;
        session.purpose = 'add_player';
        axios
        .put(`http://localhost:8082/api/sessions/${session._id}`, session)
          .then((res) => {
            console.log("Added player to session:", res.data);
          })
          .catch((err) => {
            console.log('cant find: ', err.response);
          });
    }

    function onJoinGame(selectedSession) {
        // Check whether the player already is in the session
        const playerJoined = selectedSession.slot_names.reduce(
            (acc, cur) => (cur == playerData.name) ? acc + 1 : acc, 0
            );
                    
        // Check how many free slots (how many slots that lack _id)
        const freeSlots = selectedSession.slot_ids.reduce(
            (acc, cur) => (cur == null) ? acc + 1 : acc, 0
        );

        if (playerJoined) {
            // Start game
            startGameAction(selectedSession);
        } else {
            // Otherwise check if we can add the player to the session
            if (freeSlots > 0) {
                addPlayerToSession(selectedSession, freeSlots);
                // Start game
                console.log("session:", selectedSession);
                startGameAction(selectedSession);
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
                allSessionsView.push(
                    <li> <button 
                        key={i}
                        onClick={() => onJoinGame(allSessions[i])}> Max_slots: {allSessions[i].max_slots} 
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

    async function onStartGame() {
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
            startNewGame(playerData, maxSlots);
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
                <h2>Start a new game</h2>
                <p>Max number of players:</p>
                <ul>
                    <li><button key="slot1" onClick={() => setMaxSlots(2)} >2</button></li>
                    <li><button key="slot2" onClick={() => setMaxSlots(3)} >3</button></li>
                    <li><button key="slot3" onClick={() => setMaxSlots(4)} >4</button></li>
                </ul> 
                <button onClick={onStartGame}>Create new game</button>
            </div>
            <div className='game_list_container'>
            <h2>List all games</h2>
            <ul>
                <GetSessionList />
            </ul>
            </div>
            <button onClick={selectLogin}>Log out</button>
        </div>
        </>
    );
}