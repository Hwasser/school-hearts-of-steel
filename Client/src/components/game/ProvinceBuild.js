
/**
 * Module for the build-menu within a province - that is when you want to build a farm etc
*/
import './ProvinceBuild.css';
import axios from 'axios';
import { useState } from 'react';  
const { buildings } = require('../../provinceStats');

export default function ProvinceBuild(
    { buildingType, setInactive, fromProvince, onBuildMenu, session, slotIndex} ) {
    const [errorMessage, setErrorMessage] = useState('');

    const maxBuildings = 5;

    // Whether we can afford this building
    const canAffordFood     = buildings[buildingType]['food']     <= session.food[slotIndex];
    const canAffordFuel     = buildings[buildingType]['fuel']     <= session.fuel[slotIndex];
    const canAffordTools    = buildings[buildingType]['tools']    <= session.tools[slotIndex];
    const canAffordMaterial = buildings[buildingType]['material'] <= session.material[slotIndex];

    const curCost = {
        food: buildings[buildingType]['food'],
        fuel: buildings[buildingType]['fuel'],
        tools: buildings[buildingType]['tools'],
        material: buildings[buildingType]['material']
    };

    function onConfirmButton() {
        const buildingTypes = buildingType + "s";
        if (fromProvince[buildingTypes] >= maxBuildings) {
            setErrorMessage("You cannot construct more buildings of that type in this province!");
            return;
        } else if (!canAffordFood || !canAffordFuel || !canAffordTools || !canAffordMaterial) {
            setErrorMessage("You cannot afford to construct this building!");
            return;           
        }
        updateSession(curCost, slotIndex, session._id);
        updateProvinceDatabase(fromProvince, buildingType, onBuildMenu, session);
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




// Update the province and the player data
function updateProvinceDatabase(fromProvince, buildingType, onBuildBuilding, session) {
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
    .then((res) => {
        onBuildBuilding(fromProvince);
    })
    .catch((err) => {
    console.log('Error in replacing province: ' + err);
    });

    // TODO: Remove
    const pendingAction = {
        type: 'building',
        session: session._id,
        player: session._id, // temp
        start: session.time,
        end: session.time + buildings[buildingType].time,
        province: fromProvince._id,
        text: buildingType
    }
    console.log(pendingAction);

    axios
    .post(`http://localhost:8082/api/pendings/`, pendingAction)
    .catch((err) => {
    console.log('Error with posting pending actions!: ' + err);
    });
  }

  // Update the player resources in the session
function updateSession(curCost, slotIndex, sessionId) {
    // A package with data to send to the backend
    const updatePackage = {
      food: curCost['food'],
      fuel: curCost['fuel'],
      tools: curCost['tools'],
      material: curCost['material'],
      purpose: 'buy_stuff',
      slotIndex: slotIndex,
    };
    
    axios
    .put(`http://localhost:8082/api/sessions/${sessionId}`, updatePackage)
    .catch((err) => {
        console.log('Couldnt update the session: ' + err);
    });  
  }