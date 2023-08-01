/**
 * Module for the build-menu within a province - that is when you want to build a farm etc
*/
import './ProvinceBuild.css';
import axios from 'axios';
import { useState } from 'react';  
const { buildings } = require('../../GameData/provinceStats');

export default function ProvinceBuild(
    { buildingType, setInactive, fromProvince, onBuildMenu, session, slotIndex} ) {
    const [errorMessage, setErrorMessage] = useState('');

    const maxBuildings = 5;

    // Whether we can afford this building
    const canAffordFood     = buildings[buildingType]['food']     <= session.food[slotIndex];
    const canAffordFuel     = buildings[buildingType]['fuel']     <= session.fuel[slotIndex];
    const canAffordTools    = buildings[buildingType]['tools']    <= session.tools[slotIndex];
    const canAffordMaterial = buildings[buildingType]['material'] <= session.material[slotIndex];

    function onConfirmButton() {
        const buildingTypes = buildingType + "s";
        if (fromProvince[buildingTypes] >= maxBuildings) {
            setErrorMessage("You cannot construct more buildings of that type in this province!");
            return;
        } else if (!canAffordFood || !canAffordFuel || !canAffordTools || !canAffordMaterial) {
            setErrorMessage("You cannot afford to construct this building!");
            return;           
        }
        onBuildMenu(fromProvince, buildingType);
        setInactive();
        setErrorMessage('');
    }    

    function onCancelButton() {
        setInactive();
        setErrorMessage('');
    }    

    if (buildingType == 'none' && errorMessage != '') {
        setErrorMessage('');
    }    

    const toDraw = (buildingType != 'none') ? "inline" : "none";

    return (
        <>
        {errorMessage != '' && (
          <div className="build_error">
            <p>{errorMessage}</p>
            <button onClick={onCancelButton}>ok</button>
          </div>
        )}
        {
            errorMessage == '' && (
            <div className='build_building' style={{display: toDraw}}>
            <h2 className='build_desc'> Construct a {buildingType}</h2>
                <div className='cost_field'> 
                <span>Food:</span>
                <span style={{color: (canAffordFood) ? 'black' : 'red'}}>
                    {buildings[buildingType]['food']}</span> 
                </div>
                <div className='cost_field'> 
                <span>Fuel:</span>
                <span style={{color: (canAffordFuel) ? 'black' : 'red'}}>
                    {buildings[buildingType]['fuel']}</span> 
                </div>
                <div className='cost_field'> 
                <span>Tools:</span>
                <span style={{color: (canAffordTools) ? 'black' : 'red'}}>
                    {buildings[buildingType]['tools']}</span> 
                </div>
                <div className='cost_field'> 
                <span>Material:</span>
                <span style={{color: (canAffordMaterial) ? 'black' : 'red'}}>
                    {buildings[buildingType]['material']}</span> 
                </div>
                <button 
                    className='confirm_button'
                    onClick={() => {onConfirmButton()}} 
                > 
                Confirm
                </button>
                <button 
                    className='cancel_button'
                    onClick={() => {onCancelButton()}} 
                > 
                Cancel
                </button>
            </div>
          
        )    
        }
    </>
    );
}

