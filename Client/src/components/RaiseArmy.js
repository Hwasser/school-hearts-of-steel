import axios from 'axios';
import { useState } from 'react';  

import './RaiseArmy.css';  

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
  const [state, setSlide] = useState(Math.floor(workforce / 2));
  const [errorMessage, setErrorMessage] = useState('');

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
    updateProvinceDatabase(newValue, toRaise, fromProvince, onRaiseArmy);
    updateSession(curCost, slotIndex, session._id);
  }

  
  // Whether to reset the slider
  if (workforce != curWorkforce) {
    setCurWorkforce(workforce);
    setSlide(Math.floor(workforce/ 2));
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
      
      const handleChange = e => {
        setSlide(e.target.value);
      };

      // The price to build an army at slider position
      const curPrice = {food: state * costs['food'], tools: state * costs['tools']}
      const canAffordFood  = curPrice['food']  <= session.food[slotIndex];
      const canAffordTools = curPrice['tools'] <= session.tools[slotIndex];
      const canAfford = canAffordFood && canAffordTools;
      
      const Slider = () => (
        <>

        {errorMessage != '' && (
          <div className="slider_error">
            <p>{errorMessage}</p>
            <button onClick={closeErrorMsg}>ok</button>
          </div>
        )}
        <div className='raise_army' style={{display: toDraw}}>
          <h2>Raise Army</h2>
          <p className='raise_army_costs' style={{color: (canAffordFood)  ? 'black' : 'red'}}>
            Food: {state * costs['food']}</p>
          <p className='raise_army_costs' style={{color: (canAffordTools) ? 'black' : 'red' }}>
            Tools: {state * costs['tools']}</p>
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
          <div> 
              <span>Amount:</span>
              <span>{state}</span> 
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
      10,
      curWorkforce-minLimit,
      curWorkforce-minLimit,
      "Threshold",
      "threshold"
    );

  return ( <Slider /> )
}

// Update the amount of workers in province in database
function updateProvinceDatabase(newValue, toRaise, fromProvince, onRaiseArmy) {
  // Replace the province value with one with the new workforce
  const province = fromProvince;
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
    owner: province['owner']
  };
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

const costs = {
  food: 2,
  fuel: 0,
  tools: 1,
  material: 0
}