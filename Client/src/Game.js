import Header from './Header';
import GameUI from './GameUI';
import Footer from './Footer';

import { useState } from 'react';  

export default function Game() {

    const [properties, setProperties] = useState(defaultProvinceState);

    // Handle selection of provinces from the database
    function handleSelectProvince(provinceData) {
        setProperties(provinceData);
        console.log(provinceData);
    }

    return (
        <>
        <Header />
        <GameUI onSelectAction={handleSelectProvince}/>
        <Footer properties={properties}/>
        </>
    )
    

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