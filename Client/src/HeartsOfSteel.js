import React from 'react'
import { useState } from 'react';  

import Receiver from './components/Receiver';
import MainMenu from './components/menu/MainMenu';
//import Game from './components/Game';

export default function HeartsOfSteel() {
    const [hasStarted, setHasStarted] = useState(false);

    function handleStartGame(playerData, sessionData) {
        setHasStarted(true);
    }

    return (
        <>
            {!hasStarted && (
                <MainMenu onStartGame={handleStartGame} />
            )}
            {hasStarted && (
                <div>
                    <Receiver />

                </div>
            )}
        </>

    );
}