import { useState } from 'react';
import './FootBattleView.css';

export default function FootBattleView( {properties} ) {
    const performance = properties.performance;

    return (
        <>
        <div className="footer">
            <div className='footer_row'>
                <div className='property_name'>
                    <span> Attacker </span>
                </div>
                <div className='property_name'>
                    <span> Ongoing Battle </span>
                </div>
                <div className='property_name'>
                    <span> Defender </span>
                </div>
            </div>
            <div className='footer_row'>
                <div className='property_name'>
                    <span> Soldiers left: {properties.soldiers1} </span>
                </div>
                <div className='property_name'>
                    <div id="battle_army_left" style={{flex: performance * 0.5}}> </div>
                    <div id="battle_army_right" style={{flex: 1-(performance * 0.5)}}> </div>
                </div>
                <div className='property_name'>
                    <span> Soldiers left: {properties.soldiers2} </span>
                </div>
            </div>
        </div>
        </>
    );
}