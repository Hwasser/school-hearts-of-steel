import React, { useState } from 'react'
import './WinScreen.css';

export default function WinScreen({winner, gameSession, onWinBack}) {
    // TODO: Add stats into this screen

    return (
        <>
        {winner == 'you' && (
            <div className='you_won'>
                <h1>You won!</h1>
                <button onClick={onWinBack} className='win_back_button'>FUCK YEAH!</button>
            </div>
        )}
        {winner == 'other' && (
            <div className='you_lost'>
                <h1>You lose!</h1>
                <button onClick={onWinBack} className='win_back_button'>OH NOEZ!</button>
            </div>
        )}
        </>
    );
}