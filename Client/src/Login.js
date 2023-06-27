import './Login.css';

import { useState } from 'react'; 

export default function Login( {setLogin} ) {
    // Whether the register menu should be displayed or not
    const [registerMenu, setRegisterMenu] = useState(false);
    
    return (
        <>
        <div className='login_main'>
            {registerMenu && (
                <div className='register_menu'>
                    <h2 className='register_text'>Register new user</h2>
                    <label for="username">Username:</label>
                    <input type="text" placeholder='Enter Username' name='username' required />
                    <label for="password">Password:</label>
                    <input type="password" placeholder='Enter Password' name='password' required />
                    <label for="password_again">Password again:</label>
                    <input type="password" placeholder='Enter Password' name='password_again' required />
                    
                    <button type="submit"
                        onClick={() => setLogin()}
                    >Register</button>
                    <button onClick={() => setRegisterMenu(false)}
                    >Cancel</button>
                </div>
            )}
            {!registerMenu && (
                <div className='login_container'>
                    <label for="username">Username:</label>
                    <input type="text" placeholder='Enter Username' name='username' required />
                    <label for="password">Password:</label>
                    <input type="password" placeholder='Enter Password' name='password' required />
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