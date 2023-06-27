import './Login.css';

export default function Login( {setLogin} ) {
    
    return (
        <>
        <div className='login_main'>
            <div className='login_container'>
                <label for="username">Username:</label>
                <input type="text" placeholder='Enter Username' name='username' required />
                <label for="password">Password:</label>
                <input type="password" placeholder='Enter Password' name='password' required />
                <button type="submit"
                    onClick={() => setLogin()}
                >Login</button>
            </div>
            <div className='register_container'>
                <button>Register new account</button>
            </div>
        </div>
        </>
    );
}