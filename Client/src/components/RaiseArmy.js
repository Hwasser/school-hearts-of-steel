import { useState } from 'react';  
import './RaiseArmy.css';  

// Code taken from

export default function RaiseArmy({ active, workforce}) {

  const toDraw = (active) ? "inline" : "none";

  const useSlider = (min, max, defaultState, label, id) => {
      const [state, setSlide] = useState(defaultState);
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
        </div>
        </>
      );
      return [state, Slider, setSlide];
    };
  
    const [slideValue, Slider] = useSlider(
      10,
      workforce,
      workforce,
      "Threshold",
      "threshold"
    );

  return ( <Slider /> )
  
}