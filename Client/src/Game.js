import './Game.css';
import Header from './Header';
import GameUI from './GameUI';
import Footer from './Footer';
import MainMenu from './MainMenu';
import axios from 'axios';
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

    function startGame(playerData, sessionData) {
        initAllProvinces();
        setPlayer(playerData);
        setHasStarted(true);
        setSession(sessionData);
        const curSlot = sessionData.slot_names.findIndex( (e) => e == playerData.name);
        setSlotIndex(curSlot);

    }

    // Handle selection of provinces from the database
    function handleSelectProvince(provinceData, selecting) { 
        setProperties(provinceData);
    }

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
            setProperties(provinceInfo);
        
            const army1Copy = armies[0].slice(0,nProvinces);
            const army2Copy = armies[1].slice(0,nProvinces);
            const army3Copy = armies[2].slice(0,nProvinces);
            const army4Copy = armies[3].slice(0,nProvinces);
            
            army1Copy[provinceId] = provinceInfo['army1']
            army2Copy[provinceId] = provinceInfo['army2']
            army3Copy[provinceId] = provinceInfo['army3']
            army4Copy[provinceId] = provinceInfo['army4']
            setArmies([army1Copy, army2Copy, army3Copy, army4Copy]);

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
        
    const renderGame = () => {
        return (
            <>
            {!hasStarted && (
                <MainMenu startGameAction={startGame} />
            )}
            {hasStarted && (
                <div className='game_view'>
                    <Header player={player} session={session} slotIndex={slotIndex} />
                    <GameUI 
                        onSelectAction={handleSelectProvince} 
                        updateArmies={handleUpdateArmies}
                        names={provinceNames} 
                        owners={provinceOwners} 
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

