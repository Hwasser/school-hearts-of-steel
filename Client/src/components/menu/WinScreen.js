import React, {useState} from 'react'
import axios from 'axios';
import './WinScreen.css';
import {host} from '../../backend_adress';

export default function WinScreen({winner, player, sessionId, onWinBack}) {
    // Remove session and go back to main menu
    const handleWinBack = () => {
        removeSession(sessionId);
        onWinBack();
    };

    const [session, setSession] = useState(null);
    if (!session) {
        console.log("Get session"); 
        getSession(sessionId, setSession);
    }

    // Go back to main menu
    // NOTE: Don't remove session since other players may still be alive!
    const handleLostBack = () => {
        onWinBack();
    };

    const ScoreBoard = () => {
        const nPlayers = session.slot_names.length;
        // Get sum of resources and score of all players
        const resources = new Array(nPlayers);
        for (let i = 0; i < nPlayers; i++) {
            resources[i] = session.food[i] + session.fuel[i] + session.material[i] + session.tools[i] + session.score[i];
        }
        // Sort resources and find rank
        const resourcesSorted = [...resources];
        resourcesSorted.sort();
        const rank = new Array(nPlayers);

        for (let i = 0; i < nPlayers; i++) {
            rank[i] = resourcesSorted.findIndex(e => e == resources[i]);
        }
        rank.reverse();

        const players = [];
        for (let i = 0; i < nPlayers; i++) {
            const current = rank[i];
            const playerName = session.slot_names[current];
            const playerRes = resources[current];
            const playerData = (
                <div className='win_player_row'>
                    <span className='win_player_col'>{(rank[i]+1)}</span>
                    <span className='win_player_col'>{playerName}</span>
                    <span className='win_player_col'>{playerRes}</span>
                </div>
            );
            players.push(playerData);
        }

        return (
            <div className='win_score_board'>
                <div className='win_top_row'>
                    <span className='win_player_col'>Rank:</span>
                    <span className='win_player_col'>Player Name:</span>
                    <span className='win_player_col'>Score:</span>
                </div>
                {players}
            </div>
        );
    }

    return (
        <>
        <div className='main_win_screen'>
            {winner == player.name && (
                <div className='you_won'>
                    <h1 className='win_header'>You won!</h1>
                    {session && (
                        <ScoreBoard />
                    )}
                    <button onClick={() => handleWinBack()} className='win_back_button'>Huzzah!</button>
                </div>
            )}
            {winner != player.name && (
            <div className='you_lost'>
                <h1 className='win_header'>You lose!</h1>
                {session && (
                    <ScoreBoard />
                )}
                <button onClick={() => handleLostBack()} className='win_back_button'>Sacred bleu!</button>
            </div>
        )}
        </div>
        </>
    );
}

/**
 * @brief: Get a session and set it as current session
 * 
 * @param {String} id 
 * @param {Function} setSession 
 */
async function getSession(id, setSession) { 
    await axios
    .get(host + `/api/sessions/${id}`)
    .then((res) => {
        setSession(res.data); 
    })
    .catch((err) => {
        console.log('Error in updating session: ' + err);
        
    });  
}

/**
 * @brief: Remove a session from the db
 * 
 * @param {String} id 
 */
function removeSession(id) {
    axios
    .delete(host + `/api/sessions/${id}`)
    .catch((err) => {
        console.log('Failed removing a session:', err.response);
    });
}