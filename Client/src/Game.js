import './Game.css';
import Header from './Header';
import GameUI from './GameUI';
import Footer from './Footer';

import { useState, useEffect } from 'react';  

export default function Game() {
    
    const [properties, setProperties] = useState(defaultProvinceState);
    const [provinceNames, setProvinceNames] = useState(Array(9).fill('-'));
    
    // Handle selection of provinces from the database
    function handleSelectProvince(provinceData) { 
        setProperties(provinceData);
    }

    // Handle setting province names for the view
    function handleProvinceNames(provinceNamesData) {
        setProvinceNames(provinceNamesData);
    }
    
    const renderGame = () => {
        return (
            <>
            <Header updateProvinceNames={handleProvinceNames} />
            <GameUI onSelectAction={handleSelectProvince} names={provinceNames} />
            <Footer properties={properties}/>
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