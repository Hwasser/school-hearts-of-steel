import React from 'react';
import './FootArmyView.css';  
const { units } = require('../../unitStats');

export default function armyView({provProp, upgrades}) {

  const upgradedDamage = 1 + upgrades['upg_weap2_dam'] * 0.1 + upgrades['upg_weap3_dam'] * 0.1;
  const upgradedArmor  = 0 + upgrades['upg_weap2_arm'] * 10 + upgrades['upg_weap3_arm'] * 10;

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

  const listOfUnits = [];
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
            <button className='property_button'>Split Army</button>
          </div>

          {listOfUnits}

        </div>
        </>
  );
}

