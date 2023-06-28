import './Login.css';

import { useState } from 'react'; 
import axios from 'axios';

export default function Login( {loginAction, selectRegister} ) {
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

    const onChange = (e) => {
        setPlayer({ ...player, [e.target.name]: e.target.value})
    };

    // When pressing the login button
    function onLogin() {
        console.log("Tried to login with:", player.name, player.password);
        axios
          .get('http://localhost:8082/api/players', {
            params: {name: player.name, password: player.password}
          })
          .then((res) => {
              console.log("Logged in with:", res.data);
            if (res.data != null) {
                // TODO: Change to going to a start game menu
                setLoginError(false);
                loginAction(res.data);
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
                        onChange={onChange} 
                        required />
                </div> 
                <div className='form_container'>
                    <label for="password">Password: </label>
                    <input 
                        type="password" 
                        placeholder='Enter Password' 
                        name='password' 
                        value={player.password}
                        onChange={onChange} 
                        required />
                </div>
                <button className='submit_button' type="submit"
                    onClick={onLogin}
                >Login</button>
                {loginError && (
                    <p className='login_error'>No user exists with that name or password!</p>
                )}
            </div>
            <div className='register_container'>
                <button onClick={selectRegister} >Register new account</button>
            </div>
        </div>
        </>
    );
}

