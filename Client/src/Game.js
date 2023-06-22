import './Game.css';
import Header from './Header';
import GameUI from './GameUI';
import Footer from './Footer';
import axios from 'axios';
import { armyMove, armyAttack } from './functionality/manageArmies';

import { useState, useEffect } from 'react';  

export default function Game() {

    const nProvinces = 9;
    
    const [properties, setProperties] = useState(defaultProvinceState);
    const [provinceNames, setProvinceNames] = useState(Array(nProvinces).fill('-'));
    const [provinceId, setProvinceId] = useState(Array(nProvinces).fill(''));
    const [provinceOwners, setProvinceOwners] = useState(Array(nProvinces).fill('Neutral'));
    const [army1, setArmy1] = useState(Array(nProvinces))
    const [army2, setArmy2] = useState(Array(nProvinces))
    const [army3, setArmy3] = useState(Array(nProvinces))
    const [army4, setArmy4] = useState(Array(nProvinces))

    const [hasStarted, setHasStarted] = useState(false);

    if (!hasStarted) {
        initAllProvinces();
        setHasStarted(true);
    }

    
    // Handle selection of provinces from the database
    function handleSelectProvince(provinceData) { 
        setProperties(provinceData);
    }

    // Handle province names and owners for the view
    function handleProvinceNames(allProvinces) {
        // Get a list of all province names and owners
        const provinceNamesLocal = Array(nProvinces);
        const provinceOwnersLocal = Array(nProvinces);
        const provinceIdLocal = Array(nProvinces);

        for (let i = 0; i < nProvinces; i++) {
            provinceNamesLocal[i]  = allProvinces[i]['name']
            provinceOwnersLocal[i] = allProvinces[i]['owner']
            provinceIdLocal[i] = allProvinces[i]['objectId']
        }

        console.log(allProvinces);

        setProvinceNames(provinceNamesLocal);
        setProvinceOwners(provinceOwnersLocal);
        setProvinceId(provinceIdLocal);

        // Reset all army slots
        setArmy1(Array(nProvinces));
        setArmy2(Array(nProvinces));
        setArmy3(Array(nProvinces));
        setArmy4(Array(nProvinces));
    }

    function handleRaiseArmy(provinceInfo) {
        const provinceId = provinceInfo['id'];
        try {
            setProperties(provinceInfo);
        
            const army1Copy = army1.slice(0,nProvinces);
            const army2Copy = army2.slice(0,nProvinces);
            const army3Copy = army3.slice(0,nProvinces);
            const army4Copy = army4.slice(0,nProvinces);
            
            army1Copy[provinceId] = provinceInfo['army1']
            setArmy1(army1Copy);
            army2Copy[provinceId] = provinceInfo['army2']
            setArmy2(army2Copy);
            army3Copy[provinceId] = provinceInfo['army3']
            setArmy3(army3Copy);
            army4Copy[provinceId] = provinceInfo['army4']
            setArmy4(army4Copy);


        } catch(err) {
            console.error("handleRaiseArmy: " + err);
        }
    }

    async function handleUpdateArmies(fromProvince, toProvince, army, fromSlot, isAttacking) {
        // Get a copy of all army slots
        const armiesCopy = 
            [army1.slice(0,nProvinces), army2.slice(0,nProvinces), army3.slice(0,nProvinces), army4.slice(0,nProvinces)];

        // Perform movement or attack of army
        let newOwner = '';
        if (isAttacking) {
            newOwner = await armyAttack(fromProvince, toProvince, army, fromSlot, armiesCopy);
        } else {
            await armyMove(fromProvince, toProvince, army, fromSlot, armiesCopy);
        }

        // Update armies in view
        setArmy1(armiesCopy[0]);
        setArmy2(armiesCopy[1]);
        setArmy3(armiesCopy[2]);
        setArmy4(armiesCopy[3]);

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
                setArmy1(localArmy1);
                setArmy2(localArmy2);
                setArmy3(localArmy3);
                setArmy4(localArmy4);
            }
        })
        .catch( (e) => {
            console.log(e)
        });
    }
        
    const renderGame = () => {
        return (
            <>
            <Header updateProvinceNames={handleProvinceNames} />
            <GameUI 
                onSelectAction={handleSelectProvince} 
                updateArmies={handleUpdateArmies}
                names={provinceNames} 
                owners={provinceOwners} 
                objectIds={provinceId}
                army1={army1}
                army2={army2}
                army3={army3}
                army4={army4}    
                />
            <Footer properties={properties} onRaiseArmy={handleRaiseArmy} />
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

