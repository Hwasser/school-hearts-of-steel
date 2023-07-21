import axios from 'axios';
import { useState } from 'react';
import './FootArmyView.css';  
const { units } = require('../../unitStats');

export default function FootArmyView({onSplitArmy, provProp, upgrades, isOwner, getArmies}) {
  // Whether or not to use the split menu
  const [splitMenu, setSplitMenu] = useState(false);
  // The subset of the army to split to a new army
  const [splitValue, setSplitValue] = useState({});

  const [errorMessage, setErrorMessage] = useState('');

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

  // Add a list of units for the army view
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

  // Add a list of units for the split view
  function addListOfUnitsSplit() {
    for (let u in units) {
      if (provProp[u] != null) {
        listOfUnits.push(<ArmySplitItem 
          unitName={units[u].name}
          unitType={u}
          amount={provProp[u]}
          splitValue={splitValue}
          setSplitValue={setSplitValue}
        />);
      }
    }
  }

  // Generates a list of HTML-objects for either the army-view or the split-view
  const listOfUnits = [];
  if (!splitMenu) {
    addListOfUnits()
  } else {
    addListOfUnitsSplit();
  }

  function getArmySlot(leftArmy, rightArmy, leftArmyId) {
    // Check which province and slot the army is in
    const armies = getArmies();
    const maxArmySlots = 4;
    let province = 0;
    let slot = 0;
    for (let i = 0; i < armies.length; i++) {
        for (let j = 0; j < armies[i].length; j++) {
            if (armies[i][j] == leftArmyId) {
                slot = i;
                province = j;
            }
        }
    }
    // Check whether there are free slots available in the province!
    let freeSlots = maxArmySlots;
    for (let i = 0; i < maxArmySlots; i++) {
        if (armies[i][province] != null) {
            freeSlots--;
        }
    }
    if (freeSlots == 0) {
      setErrorMessage('There are no free army slots in the province!');
    } else {
      onSplitArmy(leftArmy, rightArmy, leftArmyId, province);
    }
  }

  const handleSplit = () => {
    // The representation of the left and right side split
    const leftArmy = {};
    const rightArmy = {};
    // Whether a split actually occurs
    let leftArmyExists = false;
    let rightArmyExists = false;
    // Number of soldiers in each province
    let leftArmySoldiers  = 0;
    let rightArmySoldiers = 0;
    // Split armies into a left and right army
    for (let u in units) {
      if (!provProp[u]) {
        continue;
      }
      const giveOver = (splitValue[u] == null) ? 0 : Number(splitValue[u]); 
      const keep = provProp[u] - giveOver;

      if (keep > 0) {
        leftArmy[u]  = provProp[u] - giveOver;
        leftArmySoldiers += provProp[u] - giveOver;
        leftArmyExists = true;
      }
      if (giveOver > 0) {
        rightArmy[u] = giveOver;
        rightArmySoldiers += giveOver;
        rightArmyExists = true;
      }
    }
    // Add the total number of soldiers in each army
    leftArmy['soldiers']  = leftArmySoldiers;
    rightArmy['soldiers'] = rightArmySoldiers;
    // Ignore split all together if one side is empty
    if (leftArmyExists && rightArmyExists) {
      getArmySlot(leftArmy, rightArmy, provProp._id);
    } else {
      setErrorMessage('You cannot create an empty army!');
    }
  };

  const closeErrorMsg = () => { 
    setErrorMessage('');
  }

  return (
      <>
        {errorMessage != '' && (
          <div className="army_split_error">
            <p>{errorMessage}</p>
            <button className='popup_button' onClick={closeErrorMsg}>ok</button>
          </div>
        )}
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
                <button className='property_button' onClick={() => handleSplit()}>Confirm</button>
                <button className='property_button' onClick={() => toggleSplitMenu()}>Cancel</button>
              </>
            )}
          </div>
          {listOfUnits}
        </div>
        </>
  );
}

/**
 * @brief: Represent a unit in the split menu. Include a slider and the split amount 
 *         on each side of the slider. 
 * 
 * @param {String} unitName: The name of the unit
 * @param {Integer} amount: The amount of soldiers of this unit type 
 * @returns A react component
 */
function ArmySplitItem({unitName, unitType, amount, splitValue, setSplitValue}) {
  // The value of the slider
  const [state, setSlide] = useState(0);
  // Change slider itself
  const Slider = ({amount}) => {
    const handleChange = e => {
      setSlide(e.target.value);
      const splitValueCopy = {...splitValue}
      splitValueCopy[unitType] = e.target.value;
      setSplitValue(splitValueCopy)
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

