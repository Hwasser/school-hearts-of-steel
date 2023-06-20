import './Game.css';
import Header from './Header';
import GameUI from './GameUI';
import Footer from './Footer';

import { useState, useEffect } from 'react';  

export default function Game() {
    
    const [properties, setProperties] = useState(defaultProvinceState);
    const [provinceNames, setProvinceNames] = useState(Array(9).fill('-'));
    const [provinceOwners, setProvinceOwners] = useState(Array(9).fill('Neutral'));
    const [army1, setArmy1] = useState(Array(9))
    const [army2, setArmy2] = useState(Array(9))
    const [army3, setArmy3] = useState(Array(9))
    const [army4, setArmy4] = useState(Array(9))
    
    // Handle selection of provinces from the database
    function handleSelectProvince(provinceData) { 
        setProperties(provinceData);
    }

    // Handle province names and owners for the view
    function handleProvinceNames(allProvinces) {
        const provinceNamesLocal = Array(9);
        const provinceOwnersLocal = Array(9);

        for (let i = 0; i < allProvinces.length; i++) {
            provinceNamesLocal[i]  = allProvinces[i]['name']
            provinceOwnersLocal[i] = allProvinces[i]['owner']
        }

        setProvinceNames(provinceNamesLocal);
        setProvinceOwners(provinceOwnersLocal);
    }

    function handleRaiseArmy(provinceInfo) {
        const provinceId = provinceInfo['id'];
        try {
            setProperties(provinceInfo);
        
            const army1Copy = army1.slice(0,9);
            const army2Copy = army2.slice(0,9);
            const army3Copy = army3.slice(0,9);
            const army4Copy = army4.slice(0,9);
            
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

    const renderGame = () => {
        return (
            <>
            <Header updateProvinceNames={handleProvinceNames} />
            <GameUI 
                onSelectAction={handleSelectProvince} 
                names={provinceNames} 
                owners={provinceOwners} 
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