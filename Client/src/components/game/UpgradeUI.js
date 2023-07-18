/**
 * This component represent the view for upgrades
 */

import axios from 'axios';
import Xarrow from "react-xarrows";

import React, { useState } from 'react';  
import './UpgradeUI.css';

export default function UpgradeUI( {onCloseUpgradeView} ) {
    // TODO: Move this backwards
    const [upgrades, setUpgrades] = useState(initUpgrades);
    // Dependecies of each upgrade
    const dependecies = {
        upg_weap1: true,
        upg_weap2_dam: upgrades['upg_weap1'],
        upg_weap2_arm: upgrades['upg_weap1'],
        upg_weap2_mot: (upgrades['upg_weap1'] && upgrades['upg_tech1']),
        upg_weap3_dam: upgrades['upg_weap2_dam'],
        upg_weap3_arm: upgrades['upg_weap2_arm'],
        upg_tech1: true,
        upg_tech2: upgrades['upg_tech1'],
        upg_tech3: (upgrades['upg_tech2'] && upgrades['upg_weap2_mot']),
        upg_gunnut: upgrades['upg_weap1'],
        upg_demman: upgrades['upg_weap1'],
        upg_formor: upgrades['upg_weap2_mot'],
        upg_powsui: (upgrades['upg_weap3_dam'] && upgrades['upg_weap3_arm'] && upgrades['upg_tech2'])
    };

    const UpgradeArrow = ({p1, p2, top}) => {
        return <Xarrow start={p1} end={p2} zIndex={-1}  startAnchor='bottom' endAnchor={top}
            dashness={(upgrades[p2]) ? false : true} 
            color={(upgrades[p2]) ? 'darkslateblue' : 'lightgreen'} />
    }
    const ProductArrow = ({p1, p2, top}) => {
        return <Xarrow start={p1} end={p2} zIndex={-1}  startAnchor='bottom' endAnchor={top}
            dashness={(dependecies[p2]) ? false : true} 
            color={(dependecies[p2]) ? 'darkslateblue' : 'lightgreen'} />
    }

    const UpgButton = ({data, text}) => {
        // When buying an upgrade TODO: Add costs and stuff
        const buyUpgrade = () => {
            const upgCopy = {... upgrades};
            upgCopy[data] = true
            setUpgrades(upgCopy);
        };
        let color = 'lightgreen';
        if (upgrades[data]) {
            color = 'lightgrey';
        } else if (!dependecies[data]) {
            color = 'orangered';
        }
        // The button itself
        return <button id={data} className='upgrade_item' style={{background: color}}
            onClick={buyUpgrade}>{text}</button>;
    };

    return (
        <>
            <div className='upgrade_view'>
                <button id="back_from_upgrade_view" onClick={onCloseUpgradeView}>Return</button>
                <div className='upgrade_row'>
                    <UpgButton data={'upg_weap1'} text={'Basic Weapons'} />
                    <UpgButton data={'upg_tech1'} text={'Basic Tools'} />
                </div>
                <div className='upgrade_row'>
                    <div className='upgrade_group'>
                        <p id="upg_gunnut" className='upgrade_unlock'>Gun Nut</p>
                        <p id="upg_demman" className='upgrade_unlock'>Demolition Maniac</p>
                    </div>
                </div>
                <div className='upgrade_row'>
                    <div className='upgrade_group'>
                    <UpgButton data={'upg_weap2_dam'} text={'Improved Ammunition'} />
                    <UpgButton data={'upg_weap2_arm'} text={'Helmets'} />
                    </div>
                    <UpgButton data={'upg_weap2_mot'} text={'Mechanics'} />
                    <UpgButton data={'upg_tech2'} text={'Advanced Tools'} />
                </div>
                <div className='upgrade_row'>
                    <div className='upgrade_group'>
                        <p id="upg_formot" className='upgrade_unlock'>Fortified Truck</p>
                        <p id="upg_powsui" className='upgrade_unlock'>Power Suit</p>
                    </div>
                </div>
                <div className='upgrade_row'>
                    <div className='upgrade_group'>
                        <UpgButton data={'upg_weap3_dam'} text={'Piercing Ammunition'} />
                        <UpgButton data={'upg_weap3_arm'} text={'Kevlar'} />
                    </div>
                    <UpgButton data={'upg_tech3'} text={'Motorized Scavanging'} />
                </div>
                <UpgradeArrow p1={'upg_weap1'} p2={'upg_weap2_dam'} top={'top'} />
                <UpgradeArrow p1={'upg_weap1'} p2={'upg_weap2_arm'} top={'top'} />
                <UpgradeArrow p1={'upg_weap1'} p2={'upg_weap2_mot'} top={'auto'} />
                <UpgradeArrow p1={'upg_tech1'} p2={'upg_weap2_mot'} top={'auto'} />
                <UpgradeArrow p1={'upg_weap2_dam'} p2={'upg_weap3_dam'} top={'auto'} />
                <UpgradeArrow p1={'upg_weap2_arm'} p2={'upg_weap3_arm'} top={'auto'} />
                
                <UpgradeArrow p1={'upg_tech1'} p2={'upg_tech2'} top={'top'} />
                <UpgradeArrow p1={'upg_tech2'} p2={'upg_tech3'} top={'top'} />
                <UpgradeArrow p1={'upg_weap2_mot'} p2={'upg_tech3'} top={'top'} />
                
                <ProductArrow p1={'upg_weap1'} p2={'upg_gunnut'} top={'auto'} />
                <ProductArrow p1={'upg_weap1'} p2={'upg_demman'} top={'auto'} />
                <ProductArrow p1={'upg_weap2_mot'} p2={'upg_formot'} top={'auto'} />
                <ProductArrow p1={'upg_weap2_dam'} p2={'upg_powsui'} top={'auto'} />
                <ProductArrow p1={'upg_weap2_arm'} p2={'upg_powsui'} top={'auto'} />
                <ProductArrow p1={'upg_tech2'} p2={'upg_powsui'} top={'auto'} />

            </div>
        </>
    );
}

// Which upgrades have been taken
const initUpgrades = {
    upg_weap1: false,
    upg_weap2_dam: false,
    upg_weap2_arm: false,
    upg_weap2_mot: false,
    upg_weap3_dam: false,
    upg_weap2_arm: false,
    upg_tech1: false,
    upg_tech2: false,
    upg_tech3: false
};

