import './StartMenu.css';

import { useState } from 'react'; 
import axios from 'axios';

export default function StartMenu( {selectLogin, startGameAction, playerData} ){

    return(
        <>
            <h2>Welcome in {playerData.name}</h2>
            <button>Create new game</button>
            <button onClick={startGameAction}>Join game</button>
            <button onClick={selectLogin}>Log out</button>
        </>
    );
}