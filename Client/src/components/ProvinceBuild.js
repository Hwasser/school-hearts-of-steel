
/**
 * Module for the build-menu within a province - that is when you want to build a farm etc
*/
import './ProvinceBuild.css';
import axios from 'axios';
import { useState } from 'react';  

export default function ProvinceBuild(
    { buildingType, setInactive, fromProvince, onBuildMenu, session, slotIndex} ) {
    const [errorMessage, setErrorMessage] = useState('');

    // Whether we can afford this building
    const canAffordFood     = costs[buildingType]['food']     <= session.food[slotIndex];
    const canAffordFuel     = costs[buildingType]['fuel']     <= session.fuel[slotIndex];
    const canAffordTools    = costs[buildingType]['tools']    <= session.tools[slotIndex];
    const canAffordMaterial = costs[buildingType]['material'] <= session.material[slotIndex];

    function onConfirmButton() {
        const buildingTypes = buildingType + "s";
        if (fromProvince[buildingTypes] > 9) {
            setErrorMessage("You cannot construct more buildings of that type in this province!");
            return;
        } else if (!canAffordFood || !canAffordFuel || !canAffordTools || !canAffordMaterial) {
            setErrorMessage("You cannot afford to construct this building!");
            return;           
        }
        updateProvinceDatabase(fromProvince, buildingType, onBuildMenu);
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
                    {costs[buildingType]['food']}</span> 
                </div>
                <div className='cost_field'> 
                <span>Fuel:</span>
                <span style={{color: (canAffordFuel) ? 'black' : 'red'}}>
                    {costs[buildingType]['fuel']}</span> 
                </div>
                <div className='cost_field'> 
                <span>Tools:</span>
                <span style={{color: (canAffordTools) ? 'black' : 'red'}}>
                    {costs[buildingType]['tools']}</span> 
                </div>
                <div className='cost_field'> 
                <span>Material:</span>
                <span style={{color: (canAffordMaterial) ? 'black' : 'red'}}>
                    {costs[buildingType]['material']}</span> 
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

const costs = {
    house: {
        food: 50,
        fuel: 0,
        tools: 50,
        material: 100
    },
    mine: {
        food: 0,
        fuel: 100,
        tools: 100,
        material: 0
    },
    workshop: {
        food: 0,
        fuel: 50,
        tools: 50,
        material: 100
    },
    farm: {
        food: 0,
        fuel: 0,
        tools: 100,
        material: 100
    },
    fort: {
        food: 0,
        fuel: 0,
        tools: 50,
        material: 150
    },
    none: {
        food: 0,
        fuel: 0,
        tools: 0,
        material: 0
    }
};


// Update the province and the player data
function updateProvinceDatabase(fromProvince, buildingType, onBuildBuilding) {
    // TODO: Update player resourses
    
    // Replace the province value with one with the new workforce
    const province = fromProvince;
    // Get the document id of the province
    const id = province['_id'];
    // Check which province army slot to put army in
    const buildingTypes = buildingType + "s";
    
    // Push army to database
    province[buildingTypes] += 1;

    // Update province with army and new value of workforce
    axios
    .put(`http://localhost:8082/api/provinces/${id}`, province)
    .catch((err) => {
    console.log('Error in replacing province: ' + err);
    });

    
  }