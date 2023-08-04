import React from 'react'
import axios from 'axios';
import Xarrow from "react-xarrows";
import { useState, useMemo } from 'react';  

import './Game.css';
import Header from './Header';
import Footer from './Footer';
import GameUI from './GameUI';
import UpgradeUI from './UpgradeUI';
import Receiver from '../Receiver';
import {
    receiveResourceUpdate, 
    receiveJoinedPlayer, 
    receiveUpdateProvince} 
    from '../../functionality/receiveEvents';
import {sendEvent} from '../../functionality/sendEvents';
import {host} from '../../backend_adress';

/**
 * @brief: This Component represents a running game session
 * 
 * @param {JSON} player: See the Player-model in the backend    
 * @param {JSON} session: See the Session-model in the backend
 * @param {Integer} slotIndex: Which index the current player has in the game session
 * @param {function} onWongame: Calls a function to win the game
 * @param {function} onExitGame: Calls a function to send the player back to the menu
 * @returns 
 */
export default function Game({player, sessionData, upgradeTree, slotIndex, onWonGame, onExitGame}) {    
    //--------------------------------------
    // ------------- Init data -------------

    const nProvinces = sessionData.world_size;
    const maxArmySlots = 4; // Max army slots in province
    
    // All properties for a province, an army or a upgrade
    const [properties, setProperties] = useState(defaultProvinceState);
    // An array containing the names of all provinces
    const [provinceNames, setProvinceNames] = useState(Array(nProvinces).fill('-'));
    // Arrays containing the owners, flavors and terrains of all provinces
    const [provinceOwners, setProvinceOwners] = useState(Array(nProvinces).fill('Neutral'));
    const [provinceFlavors, setProvinceFlavors] = useState(Array(nProvinces).fill('-'));
    const [provinceTerrains, setProvinceTerrains] = useState(Array(nProvinces).fill('-'));
    const [provinceId, setProvinceId] = useState(Array(nProvinces).fill(null));
    // Contains the documentId of each army in each slot and province
    // VARIANT: armies[slot][province index]  
    const [armies, setArmies] = useState([Array(nProvinces), Array(nProvinces), Array(nProvinces), Array(nProvinces)]);
    const [battle, setBattle] = useState(Array(nProvinces).fill(null));
    // We keep another session state in the HeartsOfSteel-module to store the session when
    // starting the game. This one is regularly updated.
    // It stores the name of all players and their resources
    const [session, setSession] = useState(sessionData);
    // We keep this state so we can fetch province data and stuff when the game starts
    const [hasStarted, setHasStarted] = useState(false);
    // Whether to use the upgrade view or the game view
    const [upgradeView, setUpgradeView] = useState(false);
    const [upgrades, setUpgrades] = useState({});

    const getTime = () => {
        return session.time;
    }

    // Used for fetching pending data, can be to massive for states
    let pendingData = [];

    // Fetch province information from the server once when opening the game
    // and set slot index of the player.
    // (in the game session each player fits in a slot in arrays of information)
    if (!hasStarted) {
        setUpgrades(upgradeTree);
        initAllProvinces();
        setHasStarted(true);
    }

    const handleUpgradeView = () => {
        setUpgradeView(!upgradeView);
    }

    const getArmies = () => (armies);
    
    const handleSessionInfo = () => ({
        session: session._id.toString(),
        player: player._id.toString()
    });

    // Init all provinces when booting up the game
    function initAllProvinces(index) {
        const localProvinceNames = Array(nProvinces);
        const localProvinceOwners = Array(nProvinces);
        const localProvinceFlavors = Array(nProvinces);
        const localProvinceTerrains = Array(nProvinces);
        const localProvinceId = Array(nProvinces);
        const localArmies = [... armies]
        
        axios.get(host + '/api/provinces/', {
            params: { purpose: "get_all", session: session._id}
        })
        .then( (res) => {
            if (res.data.length !== 0) {
                for (let i = 0; i < nProvinces; i++) {
                    const province = res.data[i];
                    const index = province.id;
                    localProvinceNames[index] = province.name;
                    localProvinceOwners[index] = province.owner;
                    localProvinceFlavors[index] = province.flavor;
                    localProvinceTerrains[index] = province.terrain;
                    localProvinceId[index] = province._id;
                    for (let j = 0; j < province.armies.length; j++) {
                        localArmies[j][index] = province.armies[j];
                    }
                }

                setProvinceNames(localProvinceNames);
                setProvinceOwners(localProvinceOwners);
                setProvinceFlavors(localProvinceFlavors);
                setProvinceTerrains(localProvinceTerrains);
                setProvinceId(localProvinceId);
                setArmies(localArmies);
            }
        })
        .catch( (e) => {
            console.log(e)
        });

        getPendingData();
    }

    //--------------------------------------------------
    // --------- Handle updates from the server --------

    /**
     * @brief: Fetching the broadcast that happens at the start of each tick
     * regarding updated session resources and time
     * 
     * @param {JSON} message 
     */
    async function handleUpdateSession(message) {
        const updatedSession = receiveResourceUpdate(message, {... session}, slotIndex);
        updatedSession.time = message.time;
        setSession(updatedSession);
    }



    const handleUpdateProvince = (message) => {
        
        const province = message;
        // Make a copy of old state
        const armiesCopy = [... armies];
        const ownersCopy = [... provinceOwners];
        // Put new values into copy
        replaceArmiesInProvince(province, armiesCopy)
        ownersCopy[province.id] = province.owner;
        // Replace with copy
        setArmies(armiesCopy);
        setProvinceOwners(ownersCopy);
        // Unset battle 
        if (battle[province.id] != null) {
                const battleLocal = [... battle]
                battleLocal[province.id] = null;
                setBattle(battleLocal);
 
        }

        // If a battle is currently selected, revert view to province
        if (properties['performance'] != null) {
            const curProv = properties.province._id; 
            const recProv = message._id;
            if (curProv == recProv) {
                setProperties(message);
            }
        }
    }

    /**
     * @brief: At each session ending, update all armies on the map.
     *         This includes changing province owners and ending battles.
     * 
     * @param {JSON} dataPackage: key: province._id, value: province data 
     */
    function handleUpdateArmies(dataPackage) {
        const armiesCopy = [... armies];
        const provinceOwnersLocal = [... provinceOwners];
        const battleLocal = [... battle]
        let ownersChanged = false;
        // Iterate through each province by their key
        for (let provinceId in dataPackage) {
            const province = dataPackage[provinceId];
            replaceArmiesInProvince(province, armiesCopy);
            // Change owners if possible
            if (provinceOwnersLocal[province.id] != province.owner) {
                provinceOwnersLocal[province.id] = province.owner;
                ownersChanged = true;
            }
            if (province.enemy_army == null) {
                battleLocal[province.id] = null;
            }
            if (properties.terrain != null && properties.id == province.id) {
                onUpdateSelectedProvince(province);
            }
        }
        // Set armies to new positions
        setArmies(armiesCopy);
        // Only change owners if owners have actually changed somewhere
        if (ownersChanged) {
            setProvinceOwners(provinceOwnersLocal);
        }
        setBattle(battleLocal);
        // If a battle is currently selected and the battle has ended, 
        // revert view to default footer view
        if (properties['performance'] != null) {
            const provinceN = properties.province.id;
            if (battleLocal[provinceN] == null) {
                setProperties(defaultProvinceState);
            } 
        }
    }

    /**
     * @brief: If a province is selected, update the view if the number of
     * buildings changes or if an army has entered or left the province.
     * 
     * @param {JSON} province 
     */
    function onUpdateSelectedProvince(province) {
        const propertiesCopy = {... properties};
        let hasChanged = false;
        if (properties.houses != province.houses) {
            hasChanged = true;
            propertiesCopy.houses = province.houses;
        }
        if (properties.farms != province.farms) {
            hasChanged = true;
            propertiesCopy.farms = province.farms;
        }
        if (properties.mines != province.mines) {
            hasChanged = true;
            propertiesCopy.mines = province.mines;
        }
        if (properties.forts != province.forts) {
            hasChanged = true;
            propertiesCopy.forts = province.forts;
        }
        if (properties.workshops != province.workshops) {
            hasChanged = true;
            propertiesCopy.workshops = province.workshops;
        }
        if (properties.enemy_army != province.enemy_army) {
            hasChanged = true;
            propertiesCopy.enemy_army = province.enemy_army;
        }
        if (hasChanged) {
            setProperties(propertiesCopy);
        }
    }

    /**
     * @brief: Handle incoming battle results
     * 
     * @param {JSON} message 
     */
    const handleBattleResult = (message) => {
        try {

            // Establish battle results
            const battleLocal = [... battle]
            const provinceN = message.province.id;
            battleLocal[provinceN] = message;
            setBattle(battleLocal);
            // Update armies in province
            const armiesCopy = [... armies];
            replaceArmiesInProvince(message.province, armiesCopy);
            setArmies(armiesCopy);
            
            // If a battle is currently selected, update its view
            if (properties['performance'] != null) {
                const curProv = properties.province._id; 
                const recProv = message.province._id;
                if (curProv == recProv) {
                    setProperties(message);
                }
            } 
            // If the province is selected during battle, update it
            if (properties['terrain'] != null && properties.id == message.province.id) {
                setProperties(message.province);
            }
        } catch (err) {
            console.log(err);
        }
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
     * @brief: When a new player arrives, it receives a token from the server, it then
     * sends the token back to the server together with information about the player 
     * and its current game session. This way we can connect a client in EventSource with
     * requests to the Express.
     * 
     * @param {String} message: Token received from server 
     */
    const handlePlayerConnect = (message) => {
        axios.put(host + '/api/players', {
          params: { sessionId: session._id, token: message, player: player._id}
        })
        .catch((err) => {
            console.log('Error in connecting player: ' + err);
            
        });  
    };


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

    // When buying something, get the new resource status from the server
    function fetchResourceUpdates() {
        axios
        .get(host + `/api/sessions/${session._id}`)
        .then((res) => {
            const updatedSession = receiveResourceUpdate(res.data, {... session}, slotIndex);
            setSession(updatedSession);
        })
        .catch((err) => {
            console.log('Error in updating session: ' + err);
            
        });  
    }

    async function getPendingData() {
        await axios.get(host + '/api/pendings', {
            params: {session: session._id, player: player._id}
        })
        .then( (res) => {
            pendingData = [... res.data];
        })
        .catch( (e) => {
            console.log(e)
        });
    }

    /**
     * 
     * @param {Dict} event: Pending event 
     */
    function pushPendingData(event) {
        // Add some additional data
        event['player'] = player._id;
        event['session'] = session._id;
        event['start'] = session.time;

        sendEvent(event, pendingData, getPendingData, fetchResourceUpdates, slotIndex);   
    }

    //----------------------------------------
    // --------- Handle game actions ---------

    /**
     * @brief: Update the selected property
     * 
     * @param {JSON} selectedObject 
     * @param {String} selecting: A brief discription of what is selected 
     */
    function handleSelectAction(selectedObject, selecting) {
        
        setProperties({... selectedObject});
    }
    /**
     * @brief: Merge two armies. Updates the database and state.
     * @param {*} army1: The document id of a army
     * @param {*} army2: The document id of a army
     * @param {*} inProvince: Which province number the merge happens in 
     */
    function handleMergeArmies(army1, army2, inProvince) {
        // Push the changes to server
        const updatePackage = {
            purpose: "merge_armies",
            provinceId: provinceId[inProvince],
            army1: army1,
            army2: army2
        };

        axios
        .put(host + '/api/provinces', updatePackage)
        .catch((err) => {
            console.log('Couldnt merge armies: ' + err);
    });  
    }

    /**
     * @brief: Fetch a province from database and update the province
     * 
     * @param {Integer} index: The province number (index in array)
     */
    async function fetchAndUpdateProvince(index) {
        axios.get(host + '/api/provinces/', {
            params: { purpose: "get_by_n", id: index, session: session._id}
        })
        .then( (res) => {
            if (res.data.length !== 0) {
                handleSelectAction(res.data[0], 'province');
            }
        })
        .catch( (e) => {
            console.log(e)
        });
    }

    // Update the armies in province if a player merge two armies
    async function handleBroadcastMergeArmies(updatePackage) {
        const province = updatePackage.province;
        const armyCopy = [... armies];
        replaceArmiesInProvince(updatePackage.province, armyCopy)
        setArmies(armyCopy);
    }

    async function handleSplitArmy(leftArmy, rightArmy, leftArmyId, province) {
        // Add information to armies
        leftArmy['session'] = session._id;
        leftArmy['owner']   = provinceOwners[province];
        rightArmy['session'] = session._id;
        rightArmy['owner']   = provinceOwners[province];
        // Post changes to left army
        let newLeftId  = "";
        await axios
        .put(host + `/api/armies/${leftArmyId}`, leftArmy)
        .then((res) => {
            newLeftId = res.data.armydata._id;
            handleSelectAction(res.data);
        })
        .catch((err) => {
            console.log('Error in updating army: ' + err);
        });
        // Post new right army
        let newRightId = "";
        await axios
            .post(host + '/api/armies/', rightArmy)
            .then((res) => {newRightId = res.data.armydata._id})
            .catch((err) => {
                console.log('Error in posting army: ' + err);
        });
        // Re-order the slots with the new armies
        const newProvinceSlots = [];
        for (let i = 0; i < maxArmySlots; i++) {
            if (armies[i][province] != leftArmyId && armies[i][province] != null) {
                newProvinceSlots.push(armies[i][province]);
            }
        }
        newProvinceSlots.push(newLeftId);
        newProvinceSlots.push(newRightId);
        // Post changes of province
        const postPackage = {
            purpose: 'update_province_armies',
            armySlots: newProvinceSlots,
            provinceN: province,
            session: session._id
        };
        axios
            .put(host + '/api/provinces', postPackage)
            .catch((err) => {
            console.log('Error in replacing armies in province: ' + err);
        });
    }

    function replaceArmiesInProvince(province, armiesCopy) {
        for (let i = 0; i < maxArmySlots; i++) {
            if (i < province.armies.length) {
                armiesCopy[i][province.id] = province.armies[i];    
            } else {
                armiesCopy[i][province.id] = null;
            }
        }
    }

    function handleBuyUpgrade(upgrade) {
        // Update upgrade tree
        const upgCopy = {... upgrades};
        upgCopy[upgrade] = true
        setUpgrades(upgCopy);
        // Update the current footers view 
        const propertiesCopy = {...properties};
        propertiesCopy.status = true;
        setProperties(propertiesCopy);
        // Send new upgrade tree to server
        axios
        .put(host + `/api/upgrades/${upgCopy._id}`, upgCopy)
        .catch((err) => {
            console.log('Couldnt update upgrade tree: ' + err);
        });  
        fetchResourceUpdates();
    };


    //------------------------------------------
    // --------- Handle the game views ---------


    // Specify exactly which states that re-renders this component
    // and remember the states of the rest.
    const footer = React.useMemo( () => 
        <Footer 
            onSelectAction={handleSelectAction} 
            onSplitArmy={handleSplitArmy}
            onBuyUpgrade={handleBuyUpgrade} 
            fetchResourceUpdates={fetchResourceUpdates} 
            pushPendingData={pushPendingData}
            getTime={getTime}
            properties={properties} 
            session={{... session}}
            upgrades={upgrades}
            slotIndex={slotIndex}
            player={player}
            getArmies={getArmies}
        />, [properties, upgrades] );

    // Specify exactly which states that re-renders this component
    // and remember the states of the rest.
    const gameui = React.useMemo( () => 
    <GameUI 
        onSelectAction={handleSelectAction} 
        onMergeArmies={handleMergeArmies}
        pushPendingData={pushPendingData}
        names={provinceNames} 
        owners={provinceOwners}
        flavors={provinceFlavors}
        terrains={provinceTerrains}
        provinceId={provinceId}
        armies={armies}    
        session={session}
        player={player}
        battle={battle}
    />, [properties, armies, provinceOwners, battle]);
        
    const renderGame = () => {
        return (
            <>
            <div className='game_view'>
                <Receiver 
                    onUpdateResources={handleUpdateSession} 
                    onUpdateProvince={handleUpdateProvince} 
                    onUpdateArmies={handleUpdateArmies}
                    onAttackBattle={handleBattleResult}
                    onPlayerJoined={handlePlayerJoined}
                    onPlayerWon={handlePlayerWon} 
                    onMergeArmies={handleBroadcastMergeArmies}
                    onPlayerConnect={handlePlayerConnect}
                    onSessionInfo={handleSessionInfo}
                />
                <Header 
                    onExitGame={onExitGame}
                    onUpgradeView={handleUpgradeView}
                    player={player} 
                    session={session} 
                    slotIndex={slotIndex} 
                    upgradeView={upgradeView}
                />
                {!upgradeView && (gameui)}
                {upgradeView  && (
                    <UpgradeUI 
                        onSelectAction={handleSelectAction} 
                        upgrades={upgrades} 
                    />
                )}
                {footer}
            </div>
            </>
        )
        
    }

    return renderGame();

}


const defaultProvinceState = {
id: 0,
session: null,
name: '-',
owner: '-',
houses: 0,
workshops: 0,
farms: 0,
mines: 0,
food: 0,
fuel: 0,
material: 0,
tools: 0,
workforce: 0,
armies: []
};

