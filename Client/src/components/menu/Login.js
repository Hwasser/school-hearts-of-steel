import './Login.css';

import { useState } from 'react'; 
import axios from 'axios';
import {host} from '../../backend_adress';

/**
 * Login menu for users/players
 */

export default function Login( {onLoginAction, selectRegister} ) {
    // An empty register form
    const initValue = () => {
        return {
            name: '',
            password: '',
        }
    };

    // Whether the register menu should be displayed or not
    const [player, setPlayer] = useState(initValue);
    const [loginError, setLoginError] = useState(false);

    const handleChange = (e) => {
        setPlayer({ ...player, [e.target.name]: e.target.value})
    };

    // When pressing the login button
    function handleLogin() {
        console.log("Tried to login with:", player.name, player.password);
        axios
          .get(host + '/api/players', {
            params: {name: player.name, password: player.password}
          })
          .then((res) => {
              console.log("Logged in with:", res.data);
            if (res.data != null) {
                // TODO: Change to going to a start game menu
                setLoginError(false);
                onLoginAction(res.data);
            } else {
                setLoginError(true);
            }
          })
          .catch((err) => {
            console.log('cant find: ', err.response);
            setLoginError(true);
          });
    }

    return (
        <>
        <div className='login_main'>
            <div className='login_container'>
                <div className='form_container'>
                    <label for="username">Username: </label>
                    <input 
                        type="text" 
                        placeholder='Enter Username' 
                        name='name' 
                        value={player.name}
                        onChange={handleChange} 
                        required />
                </div> 
                <div className='form_container'>
                    <label for="password">Password: </label>
                    <input 
                        type="password" 
                        placeholder='Enter Password' 
                        name='password' 
                        value={player.password}
                        onChange={handleChange} 
                        required />
                </div>
                <button className='login_button' type="submit"
                    onClick={handleLogin}
                >Login</button>
            </div>
            {loginError && (
                <p className='login_error'>No user exists with that name or password!</p>
            )}
            <div className='register_container'>
                <button onClick={selectRegister} >Register new account</button>
            </div>
        </div>
        </>
    );
}

