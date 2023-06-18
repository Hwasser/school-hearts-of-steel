import axios from 'axios';
import { useState } from 'react';  

import './RaiseArmy.css';  

// Code inspired by from "https://codepen.io/rmichels/pen/WNegjyK"

export default function RaiseArmy({ active, workforce, id, onRaiseArmy}) {

  // When the "raise army" button has been pushed, 
  // update the workforce and push back to interface
  function onRaiseAction(toRaise) {
    const newValue = curWorkforce - toRaise; 
    updateWorkforceDatabase(newValue, id)
    onRaiseArmy(newValue);
  }

  // Minimum amout to draft or to be left in province
  const minLimit = 10;

  // State of workforce in province
  const [curWorkforce, setCurWorkforce] = useState(workforce);
  // State of slide value
  const [state, setSlide] = useState(workforce / 2);
  
  // Whether to reset the slider
  if (workforce != curWorkforce) {
    setCurWorkforce(workforce);
    setSlide(Math.floor(workforce/ 2));
  }
  
  // Whether to draw the "raise army" bar at all
  const toDraw = (active && workforce >= 20) ? "inline" : "none";

  const useSlider = (min, max, defaultState, label, id) => {
      
      const handleChange = e => {
        setSlide(e.target.value);
      };

      const Slider = () => (
        <>
        <div className='raise_army' style={{display: toDraw}}>
          <p>Raise Army</p>
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
            className='raise_button'
            onClick={() => {onRaiseAction(state)}} 
          > 
          Raise Army 
          </button>
        </div>
        </>
      );
      return [state, Slider, setSlide];
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
function updateWorkforceDatabase(newValue, index) {
  // Search for id
  axios.get('http://localhost:8082/api/provinces/', {
      params: { id: index }
    })
    .then( (res) => {
      // Replace the province value with one with the new workforce
      if (res.data.length !== 0) {
        const province = res.data[0];
        province['workforce'] = newValue;
        const id = province['_id'];
        axios
        .put(`http://localhost:8082/api/provinces/${id}`, province)
        .catch((err) => {
          console.log('Error in replacing province: ' + err);
        });
      }
    })
    .catch( (e) => {
      console.log(e)
    });
}