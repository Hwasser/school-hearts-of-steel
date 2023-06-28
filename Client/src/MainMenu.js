import Login from './components/Login';
import Register from './components/Register';
import './MainMenu.css';
import { useState } from 'react'; 

export default function MainMenu( {startGameAction} ) {
    const [whichMenu, setWhichMenu] = useState('login');

    function onLogin(playerData) {
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
            </div>
        </>
    )
}