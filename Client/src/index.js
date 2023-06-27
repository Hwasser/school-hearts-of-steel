import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Game from './Game';
import Login from './Login';

const loggedIn = new Boolean(false);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {
      loggedIn == true && (
        <Game />
      )
    }
    {
      loggedIn == false && (
        <Login />
      )
    }
  </React.StrictMode>
);