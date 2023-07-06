import React from 'react'
import axios from 'axios';

import './Game.css';
import Header from './Header';
import GameUI from './GameUI';
import Footer from './Footer';

import { armyMove, armyAttack } from '../../functionality/manageArmies';

import { useState } from 'react';  

export default function Game({player, session}) {    
    const nProvinces = 9;
    
    // All properties for a province or an army
    const [properties, setProperties] = useState(defaultProvinceState);
    // An array containing the names of all provinces
    const [provinceNames, setProvinceNames] = useState(Array(nProvinces).fill('-'));
    // An array containing the documentId of all provinces
    const [provinceId, setProvinceId] = useState(Array(nProvinces).fill(''));
    // An array containing the owners of all provinces
    const [provinceOwners, setProvinceOwners] = useState(Array(nProvinces).fill('Neutral'));
    // Contains the documentId of each army in each slot and province
    // VARIANT: armies[slot][province index]  
    const [armies, setArmies] = useState([Array(nProvinces), Array(nProvinces), Array(nProvinces), Array(nProvinces)]);
    // Which player slot the player has in the session
    const [slotIndex, setSlotIndex] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    // Fetch province information from the server once when opening the game
    // and set slot index of the player.
    // (in the game session each player fits in a slot in arrays of information)
    if (!hasStarted) {
        const curSlot = session['slot_names'].findIndex( (e) => e == player.name);
        setSlotIndex(curSlot);
        initAllProvinces();
        setHasStarted(true);
    }

    // Handle selection of provinces from the database
    function handleSelectProvince(provinceData, selecting) { 
        setProperties(provinceData);
    }

    function handleRaiseArmy(provinceInfo) {
        const provinceId = provinceInfo['id'];
        try {
            // Update province to see affected manpower
            setProperties(provinceInfo);
            // Update armies in province
            const armiesCopy = [... armies];
            armiesCopy[0][provinceId] = provinceInfo['army1']
            armiesCopy[1][provinceId] = provinceInfo['army2']
            armiesCopy[2][provinceId] = provinceInfo['army3']
            armiesCopy[3][provinceId] = provinceInfo['army4']
            setArmies(armiesCopy);

        } catch(err) {
            console.error("handleRaiseArmy: " + err);
        }

    }

    function handleBuildBuilding(provinceInfo) {
        setProperties(provinceInfo);
    }

    async function handleUpdateArmies(fromProvince, toProvince, army, fromSlot, isAttacking) {
        // Get a copy of all army slots
        const armiesCopy = 
            [armies[0].slice(0,nProvinces), armies[1].slice(0,nProvinces), armies[2].slice(0,nProvinces), armies[3].slice(0,nProvinces)];

        // Perform movement or attack of army
        let newOwner = '';
        if (isAttacking) {
            newOwner = await armyAttack(fromProvince, toProvince, army, fromSlot, armiesCopy);
        } else {
            await armyMove(fromProvince, toProvince, army, fromSlot, armiesCopy);
        }

        // Update armies in view
        setArmies([armiesCopy[0], armiesCopy[1], armiesCopy[2], armiesCopy[3]]);

        // Update province owners if army won an attack
        if (newOwner != '') {
            const provinceOwnersLocal = provinceOwners.slice(0,nProvinces);
            provinceOwnersLocal[toProvince] = newOwner;
            setProvinceOwners(provinceOwnersLocal);
        }

    }

    // Init all provinces when booting up the game
    function initAllProvinces(index) {
        const localProvinceNames = Array(nProvinces);
        const localProvinceOwners = Array(nProvinces);
        const localProvinceId = Array(nProvinces);
        const localArmy1 = Array(nProvinces);
        const localArmy2 = Array(nProvinces);
        const localArmy3 = Array(nProvinces);
        const localArmy4 = Array(nProvinces);
        
        axios.get('http://localhost:8082/api/provinces/')
        .then( (res) => {
            if (res.data.length !== 0) {
                for (let i = 0; i < nProvinces; i++) {
                    const province = res.data[i];
                    localProvinceNames[i] = province['name'];
                    localProvinceOwners[i] = province['owner'];
                    localProvinceId[i] = province['_id']
                    localArmy1[i] = province['army1'];
                    localArmy2[i] = province['army2'];
                    localArmy3[i] = province['army3'];
                    localArmy4[i] = province['army4'];
                }

                setProvinceNames(localProvinceNames);
                setProvinceOwners(localProvinceOwners);
                setProvinceId(localProvinceId);
                setArmies([localArmy1, localArmy2, localArmy3, localArmy4]);
            }
        })
        .catch( (e) => {
            console.log(e)
        });
    }
        
    const renderGame = () => {
        return (
            <>
            <div className='game_view'>
                <Header player={player} session={session} slotIndex={slotIndex} />
                <GameUI 
                    onSelectAction={handleSelectProvince} 
                    updateArmies={handleUpdateArmies}
                    names={provinceNames} 
                    owners={provinceOwners} // Pass the updated provinceOwners state here
                    armies={armies}    
                    session={session}
                    player={player}
                />
                <Footer 
                    properties={properties} 
                    onRaiseArmy={handleRaiseArmy} 
                    onBuildBuilding={handleBuildBuilding} 
                    session={session}
                    slotIndex={slotIndex}
                    player={player}
                />
            </div>
            </>
        )
        
    }

    return renderGame();

}


const defaultProvinceState = {
id: -1,
name: '-',
houses: 0,
workshops: 0,
farms: 0,
mines: 0,
food: 0,
fuel: 0,
material: 0,
tools: 0,
workforce: 0
};

