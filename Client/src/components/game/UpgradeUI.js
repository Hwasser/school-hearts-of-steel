/**
 * This component represent the view for upgrades
 */

import axios from 'axios';
import Xarrow from "react-xarrows";

import React, { useState, useRef } from 'react';  
import './UpgradeUI.css';

export default function UpgradeUI( {onCloseUpgradeView} ) {
    const upgrades = {
        upg_weap1: true,
        upg_weap2_dam: false,
        upg_weap2_arm: false,
        upg_weap2_mot: false,
        upg_weap3_dam: false,
        upg_weap2_arm: false,
        upg_tech1: false,
        upg_tech2: false,
        upg_tech3: false
    };

    const dependecies = {
        upg_weap1: true,
        upg_weap2_dam: upgrades['upg_weap1'],
        upg_weap2_arm: upgrades['upg_weap1'],
        upg_weap2_mot: upgrades['upg_weap1'],
        upg_weap3_dam: upgrades['upg_weap2_dam'],
        upg_weap2_arm: upgrades['upg_weap2_arm'],
        upg_tech1: true,
        upg_tech2: upgrades['upg_tech1'],
        upg_tech3: (upgrades['upg_tech2'] && upgrades['upg_weap2_mot']),
        upg_gunnut: upgrades['upg_tech1'],
        upg_demman: upgrades['upg_tech1'],
        upg_formor: upgrades['upg_weap2_mot'],
        upg_powsui: (upgrades['upg_weap3_dam'] && upgrades['upg_weap3_arm'] && upgrades['upg_tech2'])
    };

    const Arrow = ({p1, p2}) => {
        return <Xarrow start={p1} end={p2} zIndex={-1}
            dashness={(upgrades[p2]) ? false : true} 
            color={(upgrades[p2]) ? 'darkslateblue' 
                : ((dependecies[p2]) ? 'lightgreen' : 'red')} />
    }

    return (
        <>
            <div className='upgrade_view'>
                <button id="back_from_upgrade_view" onClick={onCloseUpgradeView}>Return</button>
                <div className='upgrade_row'>
                    <button id="upg_weap1" className='upgrade_item'>Basic Weapons</button>
                    <button id="upg_tech1" className='upgrade_item'>Basic Tools</button>
                </div>
                <div className='upgrade_row'>
                    <div className='upgrade_group'>
                        <p id="upg_gunnut" className='upgrade_unlock'>Gun Nut</p>
                        <p id="upg_demman" className='upgrade_unlock'>Demolition Maniac</p>
                    </div>
                </div>
                <div className='upgrade_row'>
                    <div className='upgrade_group'>
                        <button id="upg_weap2_dam" className='upgrade_item'>Improved Ammunition</button>
                        <button id="upg_weap2_arm" className='upgrade_item'>Helmets</button>
                        <button id="upg_weap2_mot" className='upgrade_item'>Motorized</button>

                    </div>
                    <button id="upg_tech2" className='upgrade_item'>Advanced Tools</button>
                </div>
                <div className='upgrade_row'>
                    <div className='upgrade_group'>
                        <p id="upg_formot" className='upgrade_unlock'>Fortified Truck</p>
                        <p id="upg_powsui" className='upgrade_unlock'>Power Suit</p>
                    </div>
                </div>
                <div className='upgrade_row'>
                    <div className='upgrade_group'>
                        <button id="upg_weap3_dam" className='upgrade_item'>Piercing Ammunition</button>
                        <button id="upg_weap3_arm" className='upgrade_item'>Kevlar</button>
                    </div>
                    <button id="upg_tech3" className='upgrade_item'>Motorized Scavanging</button>
                </div>
                <Arrow p1={'upg_weap1'} p2={'upg_weap2_dam'} />
                <Arrow p1={'upg_weap1'} p2={'upg_weap2_arm'} />
                <Arrow p1={'upg_weap1'} p2={'upg_weap2_mot'} />
                <Arrow p1={'upg_tech1'} p2={'upg_weap2_mot'} />
                
                <Arrow p1={'upg_weap1'} p2={'upg_gunnut'} />
                <Arrow p1={'upg_weap1'} p2={'upg_demman'} />
                <Arrow p1={'upg_weap2_mot'} p2={'upg_formot'} />
                <Arrow p1={'upg_weap2_dam'} p2={'upg_powsui'} />
                <Arrow p1={'upg_weap2_arm'} p2={'upg_powsui'} />
                <Arrow p1={'upg_tech2'} p2={'upg_powsui'} />

                <Arrow p1={'upg_weap2_dam'} p2={'upg_weap3_dam'} />
                <Arrow p1={'upg_weap2_arm'} p2={'upg_weap3_arm'} />
                <Arrow p1={'upg_tech1'} p2={'upg_tech2'} />
                <Arrow p1={'upg_tech2'} p2={'upg_tech3'} />
                <Arrow p1={'upg_weap2_mot'} p2={'upg_tech3'} />
            </div>
        </>
    );
}
