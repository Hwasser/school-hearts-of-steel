import { useState } from 'react';
import './FootArmyView.css';  
const { units } = require('../../unitStats');

export default function FootArmyView({provProp, upgrades, isOwner}) {
  const [splitMenu, setSplitMenu] = useState(false);

  const upgradedDamage = 1 + upgrades['upg_weap2_dam']*isOwner*0.1 + upgrades['upg_weap3_dam']*isOwner*0.1;
  const upgradedArmor  = 0 + upgrades['upg_weap2_arm']*isOwner*10 + upgrades['upg_weap3_arm']*isOwner*10;

  const toggleSplitMenu = () => { setSplitMenu(!splitMenu); }

  const ArmyListItem = ({unitName, amount, lowDamage, highDamage, piercing, hardness, hp}) => (
      <>
      <div className='army_row'>
            <div className='army_property'>
              <span id="army_type1_text"> {unitName}: </span>
              <span id="army_type1_value"> {amount} </span>
            </div>
            <div className='army_property'>
              <span id="army_soft1_text"> Damage: </span>
              <span id="army_soft1_value"> {lowDamage}-{highDamage} </span>
            </div>
            <div className='army_property'>
              <span id="army_hard1_text"> Piercing: </span>
              <span id="army_hard1_value"> {piercing} </span>
            </div>
            <div className='army_property'>
              <span id="army_hardness1_text"> Hardness: </span>
              <span id="army_hardness1_value"> {hardness}% </span>
            </div>
            <div className='army_property'>
              <span id="army_hp_text"> HP: </span>
              <span id="army_hp_value"> {hp} </span>
            </div>
          </div>
      </>
  );

  function ArmySplitItem({unitName, amount}) {
    // The value of the slider
    const [state, setSlide] = useState(0);
    // Change slider itself
    const Slider = ({amount}) => {
      const handleChange = e => {
        setSlide(e.target.value);
      };
  
      return (
        <input 
          type="range" 
          className="split_slider" 
          min="0" 
          max={amount} 
          step={1.0}
          value={state}
          onChange={handleChange} />
      );
    }
    // The view for each unit in the split menu
    return (
      <div className='army_row'>
        <div className='army_property'>
          <span id="army_type1_text"> {unitName}: </span>
          <span id="army_type1_value"> {amount-state} </span>
        </div>
        <Slider amount={amount} />
        <div className='army_property'>
          <span id="army_type1_text"> {unitName}: </span>
          <span id="army_type1_value"> {state} </span>
        </div>
      </div>
    );
  }
  

  function addListOfUnits() {
    for (let u in units) {
      if (provProp[u] != null) {
        const lowDamage = (units[u]['damage_low']*upgradedDamage).toFixed(1);
        const highDamage = (units[u]['damage_high']*upgradedDamage).toFixed(1);
        const piercing = (units[u]['piercing']*upgradedDamage).toFixed(1);
        const hardness = units[u]['hardness']*100 + upgradedArmor;
        const hp = units[u]['hp'];
        listOfUnits.push(<ArmyListItem 
          unitName={units[u].name}
          amount={provProp[u]}
          lowDamage={lowDamage}
          highDamage={highDamage}
          piercing={piercing}
          hardness={hardness}
          hp={hp}
        />);
      }
    }
  }

  function addListOfUnitsSplit() {
    for (let u in units) {
      if (provProp[u] != null) {
        listOfUnits.push(<ArmySplitItem 
          unitName={units[u].name}
          amount={provProp[u]}
        />);
      }
    }
  }

  const listOfUnits = [];
  if (!splitMenu) {
    addListOfUnits()
  } else {
    addListOfUnitsSplit();
  }


  return (
      <>
        <div className="footer">
          <div className='footer_row'>
            <div className='property_name'>
              <span id="army_owner_text"> Army owner: </span>
              <span id="army_owner_value"> {provProp['owner']} </span>
            </div>
            <div className='property_name'>
              <span id="army_soldiers_text"> Soldiers: </span>
              <span id="army_soldiers_value"> {provProp['soldiers']} </span>
            </div>
            {isOwner && !splitMenu && (
              <button className='property_button' onClick={() => toggleSplitMenu()}>Split Army</button>
            )}
            {isOwner && splitMenu && (
              <>
                <button className='property_button'>Confirm</button>
                <button className='property_button' onClick={() => toggleSplitMenu()}>Cancel</button>
              </>
            )}
          </div>
          {listOfUnits}
        </div>
        </>
  );
}

