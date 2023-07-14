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

    const nProvinces = sessionData.world_size;
    
    // All properties for a province or an army
    const [properties, setProperties] = useState(defaultProvinceState);
    // An array containing the names of all provinces
    const [provinceNames, setProvinceNames] = useState(Array(nProvinces).fill('-'));
    // An array containing the documentId of all provinces
    const [provinceId, setProvinceId] = useState(Array(nProvinces).fill('')); // TODO: Remove?
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
    const [provinceFlavors, setProvinceFlavors] = useState(Array(nProvinces).fill('-'));
    const [provinceTerrains, setProvinceTerrains] = useState(Array(nProvinces).fill('-'));

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
        const localProvinceFlavors = Array(nProvinces);
        const localProvinceTerrains = Array(nProvinces);
        const localArmy1 = Array(nProvinces);
        const localArmy2 = Array(nProvinces);
        const localArmy3 = Array(nProvinces);
        const localArmy4 = Array(nProvinces);
        
        axios.get('http://localhost:8082/api/provinces/')
        .then( (res) => {
            if (res.data.length !== 0) {
                for (let i = 0; i < nProvinces; i++) {
                    const province = res.data[i];
                    const index = province.id;
                    localProvinceNames[index] = province.name;
                    localProvinceOwners[index] = province.owner;
                    localProvinceId[index] = province._id;
                    localProvinceFlavors[index] = province.flavor;
                    localProvinceTerrains[index] = province.terrain;
                    localArmy1[index] = province.army1;
                    localArmy2[index] = province.army2;
                    localArmy3[index] = province.army3;
                    localArmy4[index] = province.army4;
                }

                setProvinceFlavors(localProvinceFlavors);
                setProvinceTerrains(localProvinceTerrains);
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
        // Put new values into copy
        armiesCopy[0][province.id] = province.army1;
        armiesCopy[1][province.id] = province.army2;
        armiesCopy[2][province.id] = province.army3;
        armiesCopy[3][province.id] = province.army4;
        ownersCopy[province.id] = province.owner;
        // Replace with copy
        setArmies(armiesCopy);
        setProvinceOwners(ownersCopy);
        // TODO: ..?   
    }

    /**
     * @brief: Handle broadcast from server telling an army has moved
     * 
     * @param {JSON} message 
     */
    const handleMoveArmy = (message) => {
        const armiesCopy = receiveMoveArmy(message, [... armies]);
        setArmies(armiesCopy);
        console.log("Moved army received!");
    }


    /**
     * @brief: Handle broadcast from server telling an army has attacked
     * 
     * @param {JSON} message 
     */
    const handleAttackArmy = (message) => {
        const updateData = receiveAttackArmy(message, [... armies], [... provinceOwners]);
        setArmies(updateData.armies);
        setProvinceOwners(updateData.owners);
        console.log("Attack army received!");
    }

    /**
     * @brief: Handle broadcast from server telling a new player has joined the game
     * 
     * @param {JSON} message 
     */
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


    /**
     * @brief: Handle broadcast from server telling a player has won
     * 
     * @param {JSON} message 
     */
    const handlePlayerWon = (message) => {
        if (player.name == message) {
            onWonGame('you', {... session});
        } else {
            onWonGame('other', {... session});
        }
    }

    // Fetch daily harvested resources from database and att to player
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

    /**
     * @brief: Handle changes of armies coming from this client, handles movement and attack
     * 
     * @param {Integer} fromProvince: Province we're moving from
     * @param {Integer} toProvince: Province we're moving against
     * @param {JSON} army: Document id of the army
     * @param {Integer} fromSlot: Army slot the army comes from
     * @param {Boolean} isAttacking: Whether or not the army is attacking
     */
    async function handleUpdateArmies(fromProvince, toProvince, army, fromSlot, isAttacking) {
        // Get a copy of all army slots
        const armiesCopy = [... armies];
        
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

    /**
     * @brief: Merge two armies. Updates the database and state.
     * @param {*} army1: The document id of a army
     * @param {*} army2: The document id of a army
     * @param {*} inProvince: Which province number the merge happens in 
     */
    function handleMergeArmies(army1, army2, inProvince) {
        const armyCopy = [... armies];
        const armySlotPos = new Array(); // The new position of armies in slots in province
        const maxSlots = 4;

        // Push all armies but the one that we are going to merge
        for (let i = 0; i < maxSlots; i++) {
            if (armyCopy[i][inProvince] != army2) {
                armySlotPos.push(armyCopy[i][inProvince]);
            }
        }  
        // Push the changes to server
        const updatePackage = {
            purpose: "merge_armies",
            armySlotPos: armySlotPos,
            provinceId: inProvince,
            army1: army1,
            army2: army2
        };

        axios
        .put(`http://localhost:8082/api/provinces`, updatePackage)
        .catch((err) => {
            console.log('Couldnt merge armies: ' + err);
    });  
    }

    // Update the armies in province if a player merge two armies
    async function handleBroadcastMergeArmies(updatePackage) {
        const provinceId = updatePackage.province.id;
        const armyCopy = [... armies];
        armyCopy[0][provinceId] = updatePackage.province.army1;
        armyCopy[1][provinceId] = updatePackage.province.army2;
        armyCopy[2][provinceId] = updatePackage.province.army3;
        armyCopy[3][provinceId] = updatePackage.province.army4;
        setArmies(armyCopy);
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
        onMergeArmies={handleMergeArmies}
        names={provinceNames} 
        owners={provinceOwners}
        flavors={provinceFlavors}
        terrains={provinceTerrains}
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
                        onMergeArmies={handleBroadcastMergeArmies}
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

