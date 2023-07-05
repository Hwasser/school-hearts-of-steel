import React from 'react'
import axios from 'axios';
import {
    receiveMoveArmy, 
    receiveAttackArmy, 
    receiveResourceUpdate, 
    receiveJoinedPlayer, 
    receiveUpdateProvince} 
    from './functionality/receiveEvents';

import './Game.css';
import Header from './Header';
import GameUI from './GameUI';
import Footer from './Footer';
import MainMenu from './MainMenu';

import { armyMove, armyAttack } from './functionality/manageArmies';

import { useState, useEffect } from 'react';  

export default function Game(sessionData) {

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
    // Player data
    const [player, setPlayer] = useState({name: '', password: ''});
    // About the game session
    const [session, setSession] = useState(null);
    // Which player slot the player has in the session
    const [slotIndex, setSlotIndex] = useState(0);
    
    // If the program starts for the first time, init stuff. 
    // TODO: This should be replaced with a login screen
    const [hasStarted, setHasStarted] = useState(false);
    
    // Stuff to setup as soon as the player joins the game
    function startGame(playerData, sessionData) {
        initAllProvinces();
        setPlayer(playerData);
        setSession(sessionData);
        const curSlot = sessionData.slot_names.findIndex( (e) => e == playerData.name);
        setSlotIndex(curSlot);
        setHasStarted(true);
    }

    // Handle selection of provinces from the database
    function handleSelectProvince(provinceData, selecting) { 
        setProperties(provinceData);
    }

    // Update a game session with the newest information from the backend
    function updateSession() {
        axios
        .get(`http://localhost:8082/api/sessions/${session._id}`)
        .then((res) => {
            setSession(res.data);
        })
        .catch((err) => {
            console.log('Error in updating session: ' + err);
            
        });  
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
        updateSession();
    }

    function handleBuildBuilding(provinceInfo) {
        setProperties(provinceInfo);
        updateSession();
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

    // Receive messages
    function Receive() {
    useEffect(() => {
        const eventSource = new EventSource('http://localhost:5001/rec');
        // Event handler for receiving SSE messages
        eventSource.onmessage = (event) => {

            const message = event.data;
            try {
                //console.log(message);   
            const document = JSON.parse(message)
            if (document.purpose == 'update_resources') {
                // Update players resources at each tick
                const updatedSession = receiveResourceUpdate({... session}, slotIndex);
                setSession(updatedSession);
            } else if (document.purpose == 'update_province') {
                const province = document.package;
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
            } else if (document.purpose == 'move_army') {
                const armiesCopy = receiveMoveArmy(document.package, [... armies]);
                setArmies(armiesCopy);
                console.log("Moved army received!");
            } else if (document.purpose == 'attack_army') {
                const updateData = receiveAttackArmy(document.package, [... armies], [... provinceOwners]);
                setArmies(updateData.armies);
                setProvinceOwners(updateData.owners);
                console.log("Attack army received!");
            } else if (document.purpose == 'player_joined') {
                const ownersCopy = [... provinceOwners];
                const replaceIndex = document.package.id;
                const newOwner = document.package.owner;;
                ownersCopy[replaceIndex] = newOwner;
                console.log(replaceIndex, newOwner, ownersCopy);
                setProvinceOwners(ownersCopy);
                updateSession();
            }
            } catch {
            console.log('Received message:', message);
            }
    
        };

        // Event handler for SSE errors
        eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        };

        // Event handler for SSE connection closure
        eventSource.onclose = () => {
        console.log('SSE connection closed');
        };

        // Clean up the event source when the component unmounts
        return () => {
        eventSource.close();
        };
    }, []);

    return (
        <div>
        {/* Your component JSX here */}
        </div>
    );
    };
        
    const renderGame = () => {
        return (
            <>

            {!hasStarted && (
                <MainMenu startGameAction={startGame} />
            )}
            {hasStarted && (
            <div className='game_view'>
                <Receive 
                    setSession={setSession} 
                    setArmies={setArmies} 
                    setProvinceOwners={setProvinceOwners} 
                    armies={armies}
                    provinceOwners={provinceOwners}    
                    hasStarted={hasStarted}
                />
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
            )}
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

