import './StartMenu.css';

import { useState } from 'react'; 
import axios from 'axios';

export default function StartMenu( {selectLogin, startGameAction, playerData} ){

    return(
        <>
        <div className='start_container'>
            <h2 className='welcome_text'>Welcome in {playerData.name}</h2>
            <button>Create new game</button>
            <button onClick={startGameAction}>Join game</button>
            <button onClick={selectLogin}>Log out</button>
        </div>
        </>
    );
}