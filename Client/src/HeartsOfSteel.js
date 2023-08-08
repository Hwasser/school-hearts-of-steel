import React, { useState } from 'react'

import MainMenu from './components/menu/MainMenu';
import WinScreen from './components/menu/WinScreen';
import Game from './components/game/Game';

export default function HeartsOfSteel() {
    const [hasStarted, setHasStarted] = useState(false);
    const [sessionData, setSessionData] = useState(null);
    const [playerData, setPlayerData] = useState({name: '', password: ''});
    const [upgradeTree, setUpgradeTree] = useState({});
    const [slotIndex, setSlotIndex] = useState(0);
    const [winner, setWinner] = useState('');

    function handleJoinGame(inputPlayerData, inputSessionData, upgradeTreeData, playerSlot) {
        setSlotIndex(playerSlot);
        setUpgradeTree(upgradeTreeData);
        setSessionData(inputSessionData);
        setPlayerData(inputPlayerData);
        setHasStarted(true);
    }

    function handleWonGame(whoWon) {
        setHasStarted(false);
        setWinner(whoWon);
    }

    // Return from the winner screen
    const handleWinBack = () => {
        return setWinner('');
    }

    const handleExitGame = () => {
        setHasStarted(false);
    }
    
    return (
        <>
            {!hasStarted && winner == '' && (
                <MainMenu onJoinGame={handleJoinGame} />
            )}
            {!hasStarted && winner != '' && (
                <WinScreen winner={winner} player={playerData} sessionId={sessionData._id} onWinBack={handleWinBack} />
            )}
            {hasStarted && sessionData != null && (
                <Game 
                    player={playerData} 
                    sessionData={{... sessionData}} 
                    upgradeTree={{... upgradeTree}}
                    slotIndex={slotIndex} 
                    onWonGame={handleWonGame}
                    onExitGame={handleExitGame}
                />
            )}
        </>
    );
}

