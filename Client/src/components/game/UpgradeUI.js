/**
 * This component represent the view for upgrades
 */

import React, { useState } from 'react';  
import Xarrow from "react-xarrows";
import axios from 'axios';

import './UpgradeUI.css';
import { upgradeNames, upgradeTexts, upgradeDependencies, upgradeCosts } from '../../upgradeStats';

export default function UpgradeUI( {onBuyUpgrade, upgrades} ) {
    // TODO: Move this backwards
    

    function dependencies(listOfDeps) {
        return true; // TODO: REMOVE
        if (listOfDeps.length === 0) {
            return true;
        } else {
            // The one dependency and check whether it is true or not
            const currentDeps = listOfDeps.pop();
            return upgrades[currentDeps] && dependencies(listOfDeps);
        }
    } 

    /**
     * @brief: Creates an arrow from p1 to p2 for upgrade buttons
     * 
     * @param {HTML identifier} p1: A HTML object this arrow starts from
     * @param {HTML identifier} p2: A HTML object this arrow points at
     * @param {String} end: The direction from where this arrow should arrive from at p2
     * @returns An graphical representation of an arrow
     */
    const UpgradeArrow = ({p1, p2, end}) => {
        return <Xarrow start={p1} end={p2} zIndex={-1}  startAnchor='bottom' endAnchor={end}
            dashness={(upgrades[p2]) ? false : true} 
            color={(upgrades[p2]) ? 'darkslateblue' : 'lightgreen'} />
    }
    /**
     * @brief: Creates an arrow from p1 to p2 for products that gets unlocked
     * 
     * @param {HTML identifier} p1: A HTML object this arrow starts from
     * @param {HTML identifier} p2: A HTML object this arrow points at
     * @param {String} end: The direction from where this arrow should arrive from at p2
     * @returns An graphical representation of an arrow
     */
    const ProductArrow = ({p1, p2, end}) => {
        // A list of dependencies from what this arrow points ats
        const deps = upgradeDependencies[p2];
        // A representation of the arrow
        return <Xarrow start={p1} end={p2} zIndex={-1}  startAnchor='bottom' endAnchor={end}
            dashness={(dependencies(deps)) ? false : true} 
            color={(dependencies(deps)) ? 'darkslateblue' : 'lightgreen'} />
    }

    /**
     * @brief: Creates an arrow from p1 to p2
     * 
     * @param {String} upgrade: What upgrade this arrow represents
     * @returns An graphical representation of a upgrade button
     */
    const UpgButton = ({upgrade}) => {
        const text = upgradeNames[upgrade];
        const deps = upgradeDependencies[upgrade]
        let color = 'lightgreen';
        // A list of dependencies of this upgrade button
        if (upgrades[upgrade]) {
            color = 'lightgrey';
        } else if (!dependencies(deps)) {
            color = 'orangered';
        }
        // The button itself
        return <button id={upgrade} className='upgrade_item' style={{background: color}}
            onClick={onBuyUpgrade(upgrade)}>{text}</button>;
    };

    return (
        <>
            <div className='upgrade_view'>
                <div className='upgrade_row'>
                    <UpgButton data={'upg_weap1'} />
                    <UpgButton data={'upg_tech1'} />
                </div>
                <div className='upgrade_row'>
                    <div className='upgrade_group'>
                        <p id="upg_gunnut" className='upgrade_unlock'>Gun Nut</p>
                        <p id="upg_demman" className='upgrade_unlock'>Demolition Maniac</p>
                    </div>
                </div>
                <div className='upgrade_row'>
                    <div className='upgrade_group'>
                    <UpgButton data={'upg_weap2_dam'} />
                    <UpgButton data={'upg_weap2_arm'} />
                    </div>
                    <UpgButton data={'upg_weap2_mot'} />
                    <UpgButton data={'upg_tech2'} />
                </div>
                <div className='upgrade_row'>
                    <div className='upgrade_group'>
                        <p id="upg_formot" className='upgrade_unlock'>Fortified Truck</p>
                        <p id="upg_powsui" className='upgrade_unlock'>Power Suit</p>
                    </div>
                </div>
                <div className='upgrade_row'>
                    <div className='upgrade_group'>
                        <UpgButton data={'upg_weap3_dam'} />
                        <UpgButton data={'upg_weap3_arm'} />
                    </div>
                    <UpgButton data={'upg_tech3'} />
                </div>
                <UpgradeArrow p1={'upg_weap1'} p2={'upg_weap2_dam'} end={'top'} />
                <UpgradeArrow p1={'upg_weap1'} p2={'upg_weap2_arm'} end={'top'} />
                <UpgradeArrow p1={'upg_weap1'} p2={'upg_weap2_mot'} end={'auto'} />
                <UpgradeArrow p1={'upg_tech1'} p2={'upg_weap2_mot'} end={'auto'} />
                <UpgradeArrow p1={'upg_weap2_dam'} p2={'upg_weap3_dam'} end={'auto'} />
                <UpgradeArrow p1={'upg_weap2_arm'} p2={'upg_weap3_arm'} end={'auto'} />
                
                <UpgradeArrow p1={'upg_tech1'} p2={'upg_tech2'} end={'top'} />
                <UpgradeArrow p1={'upg_tech2'} p2={'upg_tech3'} end={'top'} />
                <UpgradeArrow p1={'upg_weap2_mot'} p2={'upg_tech3'} end={'top'} />
                
                <ProductArrow p1={'upg_weap1'} p2={'upg_gunnut'} end={'auto'} />
                <ProductArrow p1={'upg_weap1'} p2={'upg_demman'} end={'auto'} />
                <ProductArrow p1={'upg_weap2_mot'} p2={'upg_formot'} end={'top'} />
                <ProductArrow p1={'upg_weap2_dam'} p2={'upg_powsui'} end={'auto'} />
                <ProductArrow p1={'upg_weap2_arm'} p2={'upg_powsui'} end={'auto'} />
                <ProductArrow p1={'upg_tech2'} p2={'upg_powsui'} end={'auto'} />

            </div>
        </>
    );
}


