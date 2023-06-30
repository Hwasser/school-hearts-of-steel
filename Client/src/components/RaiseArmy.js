import axios from 'axios';
import { useState } from 'react';  

import './RaiseArmy.css';  

// Slider code inspired by "https://codepen.io/rmichels/pen/WNegjyK"

/**
 * Contains the menu for raising armies within a province.
 */
export default function RaiseArmy({ active, setInactive, fromProvince, onRaiseArmy, session, slotIndex}) {

  // When the "raise army" button has been pushed, 
  // update the workforce and push back to interface
  function onRaiseAction(toRaise) {
    const newValue = curWorkforce - toRaise; 
    updateProvinceDatabase(newValue, toRaise, fromProvince, onRaiseArmy);
  }

  // Minimum amout to draft or to be left in province
  const minLimit = 10;
  const workforce = fromProvince['workforce'];
  const id = fromProvince['id'];

  // State of workforce in province
  const [curWorkforce, setCurWorkforce] = useState(workforce);
  // State of slide value
  const [state, setSlide] = useState(Math.floor(workforce / 2));
  const [showErrorState, setshowErrorState] = useState('');
  
  // Whether to reset the slider
  if (workforce != curWorkforce) {
    setCurWorkforce(workforce);
    setSlide(Math.floor(workforce/ 2));
  }
  
  // Whether to draw the "raise army" bar at all
  const errorState = (findArmySlot(fromProvince) == null) ? 'slots' :
    ( (workforce < 20) ? 'workforce' : 'none' );

  // Show error message if raise army cannot be used!
  if (active && errorState != 'none' && showErrorState == '') {
    if (errorState == 'slots') {
      setshowErrorState("All army slots in the province are occupied!");
    }
    if (errorState == 'workforce') {
      setshowErrorState("You need to have above 20 manpower to raise an army!");
    }
  }

  const closeErrorMsg = () => { 
    setInactive();
    setshowErrorState('');
  }

  const onCancelButton = () => { 
    setInactive();
  }

  const toDraw = (active && errorState == 'none') ? "inline" : "none";

  const useSlider = (min, max, defaultState, label, id) => {
      
      const handleChange = e => {
        setSlide(e.target.value);
      };

      const canAffordFood = (state * costs['food'] <= session.food[slotIndex]) ? 'black' : 'red';
      const canAffordTools = (state * costs['tools'] <= session.tools[slotIndex]) ? 'black' : 'red';
      

      const Slider = () => (
        <>

        {showErrorState != '' && (
          <div className="slider_error">
            <p>{showErrorState}</p>
            <button onClick={closeErrorMsg}>ok</button>
          </div>
        )}
        <div className='raise_army' style={{display: toDraw}}>
          <h2>Raise Army</h2>
          <p className='raise_army_costs' style={{color: canAffordFood}} >Food: {state * costs['food']}</p>
          <p className='raise_army_costs' style={{color: canAffordTools }}>Tools: {state * costs['tools']}</p>
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
            onClick={() => {onRaiseAction(state)}} 
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
      return [state, Slider, setSlide, errorState];
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