import React, { useState } from 'react'
import axios from 'axios';
import './WinScreen.css';
import { closeGameSession } from '../../functionality/gameSessionEnded';
import {host} from '../../backend_adress';

export default function WinScreen({winner, sessionEndData, onWinBack}) {
    // Remove session and go back to main menu
    const handleWinBack = () => {
        closeGameSession(sessionEndData);
        onWinBack();
    };

    // Go back to main menu
    // NOTE: Don't remove session since other players may still be alive!
    const handleLostBack = () => {
        onWinBack();
    };

    const ScoreBoard = () => {
        const nPlayers = sessionEndData.slot_names.length;
        // Get sum of resources of all players
        const resources = new Array(nPlayers);
        for (let i = 0; i < nPlayers; i++) {
            resources[i] = sessionEndData.food[i] + sessionEndData.fuel[i] + sessionEndData.material[i] + sessionEndData.tools[i];
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
            const playerName = sessionEndData.slot_names[current];
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
                    <span className='win_player_col'>Resources:</span>
                </div>
                {players}
            </div>
        );
    }

    return (
        <>
        <div className='main_win_screen'>
            {winner == 'you' && (
                <div className='you_won'>
                    <h1 className='win_header'>You won!</h1>
                    <ScoreBoard />
                    <button onClick={() => handleWinBack()} className='win_back_button'>Huzzah!</button>
                </div>
            )}
            {winner == 'other' && (
            <div className='you_lost'>
                <h1 className='win_header'>You lose!</h1>
                <ScoreBoard />
                <button onClick={() => handleLostBack()} className='win_back_button'>Sacred bleu!</button>
            </div>
        )}
        </div>
        </>
    );
}