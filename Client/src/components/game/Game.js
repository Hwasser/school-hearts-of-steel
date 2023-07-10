import React from 'react'
import axios from 'axios';

import './Game.css';
import Header from './Header';
import GameUI from './GameUI';
import Footer from './Footer';
import Receiver from '../Receiver';
import {
    receiveMoveArmy, 
    receiveAttackArmy, 
    receiveResourceUpdate, 
    receiveJoinedPlayer, 
    receiveUpdateProvince} 
    from '../../functionality/receiveEvents';

import { armyMove, armyAttack } from '../../functionality/manageArmies';

import { useState, useMemo } from 'react';  

export default function Game({player, sessionData, slotIndex, onWonGame}) {    

    //--------------------------------------
    // ------------- Init data -------------

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
    // We keep another session state in the HeartsOfSteel-module to store the session when
    // starting the game. This one is regularly updated.
    // It stores the name of all players and their resources
    const [session, setSession] = useState(sessionData);
    // We keep this state so we can fetch province data and stuff when the game starts
    const [hasStarted, setHasStarted] = useState(false);

    // Fetch province information from the server once when opening the game
    // and set slot index of the player.
    // (in the game session each player fits in a slot in arrays of information)
    if (!hasStarted) {
        initAllProvinces();
        setHasStarted(true);
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


    //--------------------------------------------------
    // --------- Handle updates from the server --------

    const handleUpdateResources = (message) => {
        const updatedSession = receiveResourceUpdate(message, {... session}, slotIndex);
        setSession(updatedSession);
    }

    const handleUpdateProvince = (message) => {
        console.log("handleUpdateProvince happens!");
        //TODO: Can this be removed?s
        const province = message;
        // Make a copy of old state
        const armiesCopy = [... armies];
        const ownersCopy = [... provinceOwners];
        console.log("provinceOwners:", provinceOwners);
        // Put new values into copy
        armiesCopy[0][province.id] = province['army1']
        armiesCopy[1][province.id] = province['army2']
        armiesCopy[2][province.id] = province['army3']
        armiesCopy[3][province.id] = province['army4']
        ownersCopy[province.id] = province.owner;
        // Replace with copy
        setArmies(armiesCopy);
        setProvinceOwners(ownersCopy);
        // TODO: ..?   
    }

    const handleMoveArmy = (message) => {
        const armiesCopy = receiveMoveArmy(message, [... armies]);
        setArmies(armiesCopy);
        console.log("Moved army received!");
    }

    const handleAttackArmy = (message) => {
        const updateData = receiveAttackArmy(message, [... armies], [... provinceOwners]);
        setArmies(updateData.armies);
        setProvinceOwners(updateData.owners);
        console.log("Attack army received!");
    }

    const handlePlayerJoined = (message) => {
        // Update session to include new user
        const newSession     = message.session;
        setSession(newSession);
        // Update the owner of the province to show the joined players name in the province
        const playerProvince = message.province; // Province of joining player
        const ownersCopy = [... provinceOwners];
        const replaceIndex = playerProvince.id;
        const newOwner     = playerProvince.owner;;
        ownersCopy[replaceIndex] = newOwner;
        setProvinceOwners(ownersCopy);
    }

    const handlePlayerWon = (message) => {
        if (player.name == message) {
            onWonGame('you', {... session});
        } else {
            onWonGame('other', {... session});
        }
    }

    // Fetch player resources from database
    function fetchResourceUpdates() {
        axios
        .get(`http://localhost:8082/api/sessions/${session._id}`)
        .then((res) => {
            const updatedSession = receiveResourceUpdate(res.data, {... session}, slotIndex);
            setSession(updatedSession);
        })
        .catch((err) => {
            console.log('Error in updating session: ' + err);
            
        });  
    }


    //----------------------------------------
    // --------- Handle game actions ---------

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
            fetchResourceUpdates()

        } catch(err) {
            console.error("handleRaiseArmy: " + err);
        }

    }

    function handleBuildBuilding(provinceInfo) {
        setProperties(provinceInfo);
        fetchResourceUpdates()
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

    // Specify exactly which states that re-renders this component
    // and remember the states of the rest.
    const footer = React.useMemo( () => 
        <Footer 
            properties={properties} 
            onRaiseArmy={handleRaiseArmy} 
            onBuildBuilding={handleBuildBuilding} 
            session={session}
            slotIndex={slotIndex}
            player={player}
        />, [properties] );

    // Specify exactly which states that re-renders this component
    // and remember the states of the rest.
    const gameui = React.useMemo( () => 
    <GameUI 
        onSelectAction={handleSelectProvince} 
        onUpdateArmies={handleUpdateArmies}
        names={provinceNames} 
        owners={provinceOwners} // Pass the updated provinceOwners state here
        armies={armies}    
        session={session}
        player={player}
    />, [properties, armies, provinceOwners]);
    
        
    const renderGame = () => {
        return (
            <>
            <div className='game_view'>
                <Receiver 
                        onUpdateResources={handleUpdateResources} 
                        onUpdateProvince={handleUpdateProvince} 
                        onMoveArmy={handleMoveArmy}
                        onAttackArmy={handleAttackArmy}
                        onPlayerJoined={handlePlayerJoined}
                        onPlayerWon={handlePlayerWon} 
                />
                <Header player={player} session={session} slotIndex={slotIndex} />
                {gameui}
                {footer}
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

