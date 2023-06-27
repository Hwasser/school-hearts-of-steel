import './Login.css';

import { useState } from 'react'; 
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Login( {setLogin} ) {
    // An empty register form
    const initValue = () => {
        return {
            name: '',
            password: '',
            passwordAgain: ''
        }
    };

    // Whether the register menu should be displayed or not
    const [registerMenu, setRegisterMenu] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [player, setPlayer] = useState(initValue);

    const onChange = (e) => {
        setPlayer({ ...player, [e.target.name]: e.target.value})
    };

    const onSubmit = (e) => {
        console.log("Submit:", e);
        e.preventDefault();
        
        // If the two passwords does not match
        if (player.password != player.passwordAgain) {
            setPlayer(initValue);
            setPasswordMatch(false);
            return;
        }

        setPasswordMatch(true);
        delete player['passwordAgain'];

        axios
          .post('http://localhost:8082/api/players', player)
          .then((res) => {
            // Reset value
            setPlayer(initValue);
            setRegisterMenu(false);
          })
          .catch((err) => {
            console.log('Error in registering a player!');
          });
      };
    
    return (
        <>
        <div className='login_main'>
            {registerMenu && (
                <form noValidate onSubmit={onSubmit}>
                <div className='register_menu'>
                    <h2 className='register_text'>Register new user</h2>
                    <label for="username">Username:</label>
                    <input 
                        type="text" 
                        placeholder='Enter Username' 
                        name='name' 
                        value={player.name}
                        onChange={onChange} 
                        required />
                    {!passwordMatch && (
                    <h3 className='password_match'> Passwords does not match! </h3>
                    )}
                    <label for="password">Password:</label>
                    <input 
                        type="password" 
                        placeholder='Enter Password' 
                        name='password' 
                        value={player.password}
                        onChange={onChange} 
                        required />
                    <label for="passwordAgain">Password again:</label>
                    <input 
                        type="password" 
                        placeholder='Enter Password again' 
                        name='passwordAgain' 
                        value={player.passwordAgain}
                        onChange={onChange} 
                        required />
                    <button type="submit">Register</button>
                    <button onClick={() => setRegisterMenu(false)}
                    >Cancel</button>
                </div>
                </form>
            )}
            {!registerMenu && (
                <div className='login_container'>
                    <label for="username">Username:</label>
                    <input 
                        type="text" 
                        placeholder='Enter Username' 
                        name='username'
                        value={player.name}
                        onChange={onChange} 
                        required />
                    <label for="password">Password:</label>
                    <input 
                        type="password" 
                        placeholder='Enter Password' 
                        name='password' 
                        value={player.password}
                        onChange={onChange} 
                        required />
                    <button type="submit"
                        onClick={() => setLogin()}
                    >Login</button>
                </div>
            )}
            <div className='register_container'>
                <button onClick={() => setRegisterMenu(!registerMenu)} >Register new account</button>
            </div>
        </div>
        </>
    );
}

