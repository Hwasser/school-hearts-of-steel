import React, { useState } from 'react'

import Receiver from './components/Receiver';
import MainMenu from './components/menu/MainMenu';
import Game from './components/game/Game';
import {
    receiveMoveArmy, 
    receiveAttackArmy, 
    receiveResourceUpdate, 
    receiveJoinedPlayer, 
    receiveUpdateProvince} 
    from './functionality/receiveEvents';

export default function HeartsOfSteel() {
    const [hasStarted, setHasStarted] = useState(false);
    const [sessionData, setSessionData] = useState(null);
    const [playerData, setPlayerData] = useState({name: '', password: ''});
    const [slotIndex, setSlotIndex] = useState(0);

    function handleJoinGame(inputPlayerData, inputSessionData) {
        const curSlot = inputSessionData['slot_names'].findIndex( (e) => e == inputPlayerData.name);
        setSlotIndex(curSlot);
        setSessionData(inputSessionData);
        setPlayerData(inputPlayerData);
        setHasStarted(true);
    }

    const handleUpdateResources = (message) => {
        const updatedSession = receiveResourceUpdate(message, {... sessionData}, slotIndex);
        setSessionData(updatedSession);
    }

    const handleUpdateProvince = (message) => {
        //    
    }

    const handleMoveArmy = (message) => {
        //
    }

    const handleAttackArmy = (message) => {
        //
    }

    const handlePlayerJoined = (message) => {
        //
    }

    const handlePlayerWon = (message) => {
        //
    }
    
    return (
        <>
            {!hasStarted && (
                <MainMenu onJoinGame={handleJoinGame} />
            )}
            {hasStarted && sessionData != null && (
                <div>
                    <Receiver 
                        onUpdateResources={handleUpdateResources} 
                        onUpdateProvince={handleUpdateProvince} 
                        onMoveArmy={handleMoveArmy}
                        onAttackArmy={handleAttackArmy}
                        onPlayerJoined={handlePlayerJoined}
                        onPlayerWon={handlePlayerWon} />
                    <Game player={playerData} session={sessionData} />
                </div>
            )}
        </>
    );
}

