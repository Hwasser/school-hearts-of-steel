import React from 'react'
import { useState } from 'react';  

import Receiver from './components/Receiver';
import MainMenu from './components/menu/MainMenu';
import Game from './components/game/Game';

export default function HeartsOfSteel() {
    const [hasStarted, setHasStarted] = useState(false);
    const [sessionData, setSessionData] = useState(null);
    const [playerData, setPlayerData] = useState({name: '', password: ''});

    function handleJoinGame(inputPlayerData, inputSessionData) {
        setSessionData(inputSessionData);
        setPlayerData(inputPlayerData);
        setHasStarted(true);
    }

    console.log("MENU HAPPENS");
    
    return (
        <>
            {!hasStarted && (
                <MainMenu onJoinGame={handleJoinGame} />
            )}
            {hasStarted && sessionData != null && (
                <div>
                    <Receiver />
                    <Game playerData={{... playerData}} sessionData={{... sessionData}} />
                </div>
            )}
        </>
    );
}