import './Game.css';
import Header from './Header';
import GameUI from './GameUI';
import Footer from './Footer';
import axios from 'axios';

import { useState, useEffect } from 'react';  

export default function Game() {
    
    const [properties, setProperties] = useState(defaultProvinceState);
    const [provinceNames, setProvinceNames] = useState(Array(9).fill('-'));
    const [provinceId, setProvinceId] = useState(Array(9).fill(''));
    const [provinceOwners, setProvinceOwners] = useState(Array(9).fill('Neutral'));
    const [army1, setArmy1] = useState(Array(9))
    const [army2, setArmy2] = useState(Array(9))
    const [army3, setArmy3] = useState(Array(9))
    const [army4, setArmy4] = useState(Array(9))

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
        const provinceNamesLocal = Array(9);
        const provinceOwnersLocal = Array(9);
        const provinceIdLocal = Array(9);

        for (let i = 0; i < allProvinces.length; i++) {
            provinceNamesLocal[i]  = allProvinces[i]['name']
            provinceOwnersLocal[i] = allProvinces[i]['owner']
            provinceIdLocal[i] = allProvinces[i]['objectId']
        }

        console.log(allProvinces);

        setProvinceNames(provinceNamesLocal);
        setProvinceOwners(provinceOwnersLocal);
        setProvinceId(provinceIdLocal);

        // Reset all army slots
        setArmy1(Array(9));
        setArmy2(Array(9));
        setArmy3(Array(9));
        setArmy4(Array(9));
    }

    function handleRaiseArmy(provinceInfo) {
        const provinceId = provinceInfo['id'];
        try {
            setProperties(provinceInfo);
        
            const army1Copy = army1.slice(0,8);
            const army2Copy = army2.slice(0,8);
            const army3Copy = army3.slice(0,8);
            const army4Copy = army4.slice(0,8);
            
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

    function handleUpdateArmies(fromProvince, toProvince, army, fromSlot, isAttacking) {
        // Re-arrange the slots in the source province
        function rearrangeSourceSlots() {
            armiesCopy[fromSlot][fromProvince] = null;

            if (fromSlot < 3) {
                for (let i = 0; i < 3; i++) {
                    if (armiesCopy[i][fromProvince] == null) {
                        armiesCopy[i][fromProvince] = armiesCopy[i+1][fromProvince];
                        armiesCopy[i+1][fromProvince] = null;
                    }
                }
            }
        }
        
        // Get a copy of all army slots
        const armiesCopy = [army1.slice(0,8), army2.slice(0,8), army3.slice(0,8), army4.slice(0,8)];
        
        rearrangeSourceSlots();
        
        // Put army in a free slot
        for (let i = 0; i < 4; i++) {
            if (armiesCopy[i][toProvince] == null) {
                armiesCopy[i][toProvince] = army;
                break;
            }
        }

        console.log(armiesCopy[0][8], armiesCopy[1][8], armiesCopy[2][8], armiesCopy[3][8]);

        // Update armies
        setArmy1(armiesCopy[0]);
        setArmy2(armiesCopy[1]);
        setArmy3(armiesCopy[2]);
        setArmy4(armiesCopy[3]);

        // Replace armies in database
        replaceArmyInProvince(fromProvince, armiesCopy);
        replaceArmyInProvince(toProvince, armiesCopy);
    }

    // TODO: KNOWN BUG! When moved from province 8 to another province army doubles
    function replaceArmyInProvince(provinceId, armies) {
        // First we must get the latest properties of the province
        axios.get('http://localhost:8082/api/provinces/', {
        params: { id: provinceId}
        })
        .then( (res) => {
            // Update province with new army data
            const province = res.data[0];
            const id = province['_id'];
            console.log("Before", province);
            province['army1'] = armies[0][provinceId];
            province['army2'] = armies[1][provinceId];
            province['army3'] = armies[2][provinceId];
            province['army4'] = armies[3][provinceId];
            console.log("After", province);
            axios
            .put(`http://localhost:8082/api/provinces/${id}`, province)
            .catch((err) => {
            console.log('Error in replacing armies in province: ' + err);
            });
        })
        .catch( (e) => {
        console.log(e)
        });
    }

    // Init all provinces when booting up the game
    function initAllProvinces(index) {
        const localProvinceNames = Array(9);
        const localProvinceOwners = Array(9);
        const localProvinceId = Array(9);
        const localArmy1 = Array(9);
        const localArmy2 = Array(9);
        const localArmy3 = Array(9);
        const localArmy4 = Array(9);
        
        axios.get('http://localhost:8082/api/provinces/')
        .then( (res) => {
            if (res.data.length !== 0) {
                for (let i = 0; i < 9; i++) {
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

