import React, { useState } from 'react'

import MainMenu from './components/menu/MainMenu';
import Game from './components/game/Game';

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

    function handleWonGame(whoWon) {
        setHasStarted(false);
    }
    
    return (
        <>
            {!hasStarted && (
                <MainMenu onJoinGame={handleJoinGame} />
            )}
            {hasStarted && sessionData != null && (
                <Game 
                    player={playerData} 
                    sessionData={{... sessionData}} 
                    slotIndex={slotIndex} 
                    onWonGame={handleWonGame}
                />
            )}
        </>
    );
}

