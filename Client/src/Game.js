import Header from './Header';
import GameUI from './GameUI';
import Footer from './Footer';

import { useState } from 'react';  

export default function Game() {

    const [properties, setProperties] = useState([Array(11).fill(null)]);

    // Handle selection of provinces from the database
    function handleSelectProvince(provinceData) {
        setProperties(provinceData);
    }

    return (
        <>
        <Header />
        <GameUI onSelectAction={handleSelectProvince}/>
        <Footer properties={properties}/>
        </>
    )
    

}