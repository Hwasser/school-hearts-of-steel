import Login from './Login';
import Register from './Register';
import StartMenu from './StartMenu';
import './MainMenu.css';
import { useState } from 'react'; 

export default function MainMenu( {onJoinGame} ) {
    const [whichMenu, setWhichMenu] = useState('login');
    const [playerData, setPlayerData] = useState(null);

    function handleLogin(newPlayerData) {
        setPlayerData(newPlayerData);
        setWhichMenu('start');        
    }

    function handleJoinGame(sessionData, upgradeTree, playerSlot) {
        console.log("STARTED GAME!");
        onJoinGame(playerData, sessionData, upgradeTree, playerSlot);
    }

    const setRegisterMenu = () => {setWhichMenu('register')};
    const setLoginMenu    = () => {setWhichMenu('login')};

    return (
        <>
            <div className='menu_main'>
            {whichMenu == 'login' && (
                <Login onLoginAction={handleLogin} selectRegister={setRegisterMenu} />
            )}
            {whichMenu == 'register' && (
                <Register selectLogin={setLoginMenu} />
            )}
            {whichMenu == 'start' && (
                <StartMenu 
                    selectLogin={setLoginMenu} 
                    onJoinGame={handleJoinGame} 
                    playerData={playerData} />
            )}
            </div>
        </>
    )
}