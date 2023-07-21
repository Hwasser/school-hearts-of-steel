import React, { useState } from 'react'
import './WinScreen.css';
import { closeGameSession } from '../../functionality/gameSessionEnded';

export default function WinScreen({winner, sessionEndData, onWinBack}) {
    // TODO: Add stats into this screen

    const handleWinBack = () => {
        closeGameSession(sessionEndData);
        onWinBack();
    };

    return (
        <>
        {winner == 'you' && (
            <div className='you_won'>
                <h1>You won!</h1>
                <button onClick={() => handleWinBack()} className='win_back_button'>FUCK YEAH!</button>
            </div>
        )}
        {winner == 'other' && (
            <div className='you_lost'>
                <h1>You lose!</h1>
                <button onClick={() => handleWinBack()} rclassName='win_back_button'>OH NOEZ!</button>
            </div>
        )}
        </>
    );
}