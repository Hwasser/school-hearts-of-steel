import React, { useState } from 'react'

import MainMenu from './components/menu/MainMenu';
import WinScreen from './components/menu/WinScreen';
import Game from './components/game/Game';

export default function HeartsOfSteel() {
    const [hasStarted, setHasStarted] = useState(false);
    const [sessionData, setSessionData] = useState(null);
    const [playerData, setPlayerData] = useState({name: '', password: ''});
    const [slotIndex, setSlotIndex] = useState(0);
    const [winner, setWinner] = useState('');

    function handleJoinGame(inputPlayerData, inputSessionData) {
        const curSlot = inputSessionData['slot_names'].findIndex( (e) => e == inputPlayerData.name);
        setSlotIndex(curSlot);
        setSessionData(inputSessionData);
        setPlayerData(inputPlayerData);
        setHasStarted(true);
    }

    function handleWonGame(whoWon, endSession) {
        setHasStarted(false);
        setWinner(whoWon);
        setSessionData(endSession);
    }

    // Return from the winner screen
    const handleWinBack = () => {
        return setWinner('');
    }
    
    return (
        <>
            {!hasStarted && winner == '' && (
                <MainMenu onJoinGame={handleJoinGame} />
            )}
            {!hasStarted && winner != '' && (
                <WinScreen winner={winner} sessionEndData={sessionData} onWinBack={handleWinBack} />
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

