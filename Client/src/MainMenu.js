import Login from './components/Login';
import Register from './components/Register';
import StartMenu from './components/StartMenu';
import './MainMenu.css';
import { useState } from 'react'; 

export default function MainMenu( {startGameAction} ) {
    const [whichMenu, setWhichMenu] = useState('login');
    const [playerData, setPlayerData] = useState(null);

    function onLogin(newPlayerData) {
        setPlayerData(newPlayerData);
        setWhichMenu('start');        
    }

    function onStartGame(sessionData) {
        console.log("STARTED GAME!");
        startGameAction(playerData);
    }

    const setRegisterMenu = () => {setWhichMenu('register')};
    const setLoginMenu    = () => {setWhichMenu('login')};

    return (
        <>
            <div className='menu_main'>
            {whichMenu == 'login' && (
                <Login loginAction={onLogin} selectRegister={setRegisterMenu} />
            )}
            {whichMenu == 'register' && (
                <Register selectLogin={setLoginMenu} />
            )}
            {whichMenu == 'start' && (
                <StartMenu 
                    selectLogin={setLoginMenu} 
                    startGameAction={onStartGame} 
                    playerData={playerData} />
            )}
            </div>
        </>
    )
}