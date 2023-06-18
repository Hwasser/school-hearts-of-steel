import './Footer.css';  
import RaiseArmy from './components/RaiseArmy';
import { useState } from 'react';

export default function Footer( {properties} ) {

  const [provProp, setProvProp] = useState(properties);
  const [useRaiseSlider, setUseRaiseSlider] = useState(false);

  const onRaiseArmy = () => { setUseRaiseSlider(!useRaiseSlider); }
  if (properties != provProp) {
    setProvProp(properties);
    setUseRaiseSlider(false);
  }

  return (
    <div className="footer">

      <RaiseArmy active={useRaiseSlider} workforce={provProp['workforce']} /> 

      <div className='footer_row'>
        <div className='property_name'>
          <span id="name1"> Province: </span>
          <span id="value1"> {provProp['name']} </span>
        </div>
        <div className='property'>
          <span id="name10"> Manpower: </span>
          <span id="value10"> {provProp['workforce']} </span>
        </div>
        <button 
          className='property_button'
            onClick={onRaiseArmy}
          >
          <span id="name12"> Raise Army </span>
        </button>
        
      </div>

      <div className='footer_row'>

        <button className='property_button'>
          <span id="name6"> Houses: </span>
          <span id="value6"> {provProp['houses']} </span>
        </button>

        <button className='property_button'>
          <span id="name7"> Mines: </span>
          <span id="value7"> {provProp['mines']} </span>
        </button>

        <button className='property_button'>
          <span id="name8"> Workshops: </span>
          <span id="value8"> {provProp['workshops']} </span>
        </button>

        <button className='property_button'>
          <span id="name9"> Farms: </span>
          <span id="value9"> {provProp['farms']} </span>
        </button>

        <button className='property_button'>
          <span id="name11"> Fortifications: </span>
          <span id="value11"> {provProp['forts']} </span>
        </button>

      </div>
  
      <div className='footer_row'>

        <div className='property'>
          <span id="name2"> Food: </span>
          <span id="value2"> {provProp['food']} </span>
        </div>

        <div className='property'>
          <span id="name3"> Fuel: </span>
          <span id="value3"> {provProp['fuel']} </span>
        </div>

        <div className='property'>
          <span id="name4"> Tools: </span>
          <span id="value4"> {provProp['tools']} </span>
        </div>

        <div className='property'>
          <span id="name5"> Material: </span>
          <span id="value5"> {provProp['material']} </span>
        </div>

      </div>

    </div>
  );
}

