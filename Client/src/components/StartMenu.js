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

    function onJoinGame(selectedSession) {
        if (selectedSession.slot_names.length < selectedSession.max_slots) {
            startGameAction(selectedSession);
        } else {
            console.log("This game session is full!");
            // TODO: IMPLEMENT AN ERROR MESSAGE FOR THE PLAYER!
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

    function onStartGame() {
        const newSession = {
            max_slots: maxSlots,
            slot_names: [playerData.name],
            slot_ids: [playerData._id]
        }
        axios
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