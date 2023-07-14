import axios from 'axios';
import { useState } from 'react';  

import './RaiseArmy.css';  
const { units } = require('../../unitStats');

// Slider code inspired by "https://codepen.io/rmichels/pen/WNegjyK"

/**
 * Contains the menu for raising armies within a province.
 */
export default function RaiseArmy({ active, setInactive, fromProvince, onRaiseArmy, session, slotIndex}) {
  // Minimum amout to draft or to be left in province
  const minLimit = 10;
  const workforce = fromProvince['workforce'];
  const id = fromProvince['id'];

  // State of workforce in province
  const [curWorkforce, setCurWorkforce] = useState(workforce);
  // State of slide value
  const [errorMessage, setErrorMessage] = useState('');
  // Which type of unit to create
  const [selectedUnit, setSelectedUnit] = useState('militia');
  const onSelectUnit = (unit) => {
    setSelectedUnit(unit);
  }

  if (workforce != curWorkforce) {
    setCurWorkforce(workforce);
  }


  // When the "raise army" button has been pushed, 
  // update the workforce and push back to interface
  function onRaiseAction(toRaise, curCost, canAfford) {
    if (!canAfford) {
      setErrorMessage("You annot afford this army!");
      return;
    }
    if (findArmySlot(fromProvince) == null) {
      setErrorMessage("All army slots in the province are occupied!");
      return;
    } else if (workforce < 20) {
      setErrorMessage("You need to have above 20 manpower to raise an army!");
      return;
    }

    const newValue = curWorkforce - toRaise; 
    postArmyToServer(newValue, toRaise, fromProvince, onRaiseArmy, selectedUnit, session._id);
    updateSession(curCost, slotIndex, session._id);
  }

  const closeErrorMsg = () => { 
    setInactive();
    setErrorMessage('');
  }

  const onCancelButton = () => { 
    setInactive();
  }

  const toDraw = (active && errorMessage == '') ? "inline" : "none";

  const useSlider = (min, max, defaultState, label, id) => {

      const [state, setSlide] = useState(Math.floor(curWorkforce / 2));
      
      const handleChange = e => {
        setSlide(e.target.value);
      };

      // The price to build an army at slider position
      const curPrice = {food: state * units[selectedUnit]['cost']['food'], 
        tools: state * units[selectedUnit]['cost']['tools'],
        fuel: state * units[selectedUnit]['cost']['fuel'],
        material: state * units[selectedUnit]['cost']['material']};
      const canAffordFood  = curPrice['food']  <= session.food[slotIndex];
      const canAffordTools = curPrice['tools'] <= session.tools[slotIndex];
      const canAffordFuel  = curPrice['fuel']  <= session.fuel[slotIndex];
      const canAffordMaterial  = curPrice['material']  <= session.material[slotIndex];
      const canAfford = canAffordFood && canAffordTools && canAffordFuel && canAffordMaterial;
      
      const Slider = () => (
        <>

        {errorMessage != '' && (
          <div className="slider_error">
            <p>{errorMessage}</p>
            <button onClick={closeErrorMsg}>ok</button>
          </div>
        )}
        <div className='raise_army' style={{display: toDraw}}>
          <h2 className='raise_army_title'>Raise Army</h2>
          <h3 className='raise_army_title'>Requirements:</h3>
          <p className='raise_army_costs' style={{color: (canAffordFood)  ? 'black' : 'red'}}>
            Food: {state * units[selectedUnit]['cost']['food']}</p>
          <p className='raise_army_costs' style={{color: (canAffordTools) ? 'black' : 'red' }}>
            Tools: {state * units[selectedUnit]['cost']['tools']}</p>
          <p className='raise_army_costs' style={{color: (canAffordFuel) ? 'black' : 'red' }}>
            Fuel: {state * units[selectedUnit]['cost']['fuel']}</p>
          <p className='raise_army_costs' style={{color: (canAffordMaterial) ? 'black' : 'red' }}>
            Material: {state * units[selectedUnit]['cost']['material']}</p>

          <h3 className='raise_army_title'>Specifications:</h3>

          <p>"{units[selectedUnit]['info']}"</p>
          
          <div>
            <button className={(selectedUnit == 'militia' ? 'army_type_selected' : 'army_type')} 
              onClick={() => onSelectUnit('militia')} >Militia</button>
            <button className={(selectedUnit == 'demolition_maniac' ? 'army_type_selected' : 'army_type')} 
              onClick={() => onSelectUnit('demolition_maniac')} >Demolition Maniac</button>
            <button className={(selectedUnit == 'gun_nut' ? 'army_type_selected' : 'army_type')}
              onClick={() => onSelectUnit('gun_nut')} >Gun Nut</button>
            <button className={(selectedUnit == 'fortified_truck' ? 'army_type_selected' : 'army_type')}
              onClick={() => onSelectUnit('fortified_truck')} >Fortified Truck</button>
            <button className={(selectedUnit == 'power_suit' ? 'army_type_selected' : 'army_type')}
              onClick={() => onSelectUnit('power_suit')} >Power Suit</button>
          </div>

          {curWorkforce >= 20 && (
            <>
            <input
              className='slider'
              type="range"
              id={id}
              min={min}
              max={max}
              step={1.0}
              value={state}
              onChange={handleChange}
            />
            </>
          )}
          <div> 
              <span>Amount: </span>
              <span style={{color: curWorkforce < 20 ? 'red' : 'black'}}>{state}</span> 
          </div>
          <button 
            className='confirm_button'
            onClick={() => {onRaiseAction(state, curPrice, canAfford)}} 
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
        </>
      );
      return [state, Slider, setSlide, errorMessage];
    };
  
    // The values for the slider, min, max, default etc
    const [slideValue, Slider] = useSlider(
      minLimit,
      curWorkforce-minLimit,
      curWorkforce/2,
      "Threshold",
      "threshold"
    );

  return ( <Slider /> )
}

// Update the amount of workers in province in database
function postArmyToServer(newValue, toRaise, fromProvince, onRaiseArmy, selectedUnit, sessionId) {
  // Replace the province value with one with the new workforce
  const province = {... fromProvince};
  // Get the document id of the province
  const id = province['_id'];
  // Check which province army slot to put army in
  const armySlot = findArmySlot(province);
  if (armySlot == null) {
    console.log("No army slot in province!");
    return;
  }
  // Push army to database
  const army = {
    soldiers: toRaise,
    owner: province['owner'],
    session: sessionId
  };
  army[selectedUnit] = toRaise;
  console.log("Raising army:", army);

  axios
  .post('http://localhost:8082/api/armies', army)
  .then( (res2) => {
    console.log("Succsesfully added army: " + res2.data.armydata);
    // Change the workforce number of the province
    province['workforce'] = newValue; 
    province[armySlot] = res2.data.armydata._id;
    onRaiseArmy(province);
    // Update province with army and new value of workforce
    axios
    .put(`http://localhost:8082/api/provinces/${id}`, province)
    .catch((err) => {
      console.log('Error in replacing province: ' + err);
    });
  })
  .catch((err) => {
      console.log('Error in creating army: ' + err);
      
  });  
}

// Update the player resources in the session
function updateSession(curCost, slotIndex, sessionId) {
  // A package with data to send to the backend
  const updatePackage = {
    food: curCost['food'],
    fuel: 0,
    tools: curCost['tools'],
    material: 0,
    purpose: 'buy_stuff',
    slotIndex: slotIndex,
  };
  
  axios
  .put(`http://localhost:8082/api/sessions/${sessionId}`, updatePackage)
  .catch((err) => {
      console.log('Couldnt update the session: ' + err);
  });  
}

function findArmySlot(province) {
  let armySlot;
  if (province['army1'] == null) {
    armySlot = 'army1';
  } else if (province['army2'] == null) {
    armySlot = 'army2';
  } else if (province['army3'] == null) {
    armySlot = 'army3';
  } else if (province['army4'] == null) {
    armySlot = 'army4';
  }  
  return armySlot;
}