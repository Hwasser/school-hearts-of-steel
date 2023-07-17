import React from 'react';
import './ArmyView.css';  
const { units } = require('../../unitStats');

export default function armyView({provProp}) {

    const ArmyListItem = ({unitType, unitName, amount}) => (
        <>
        <div className='army_row'>
              <div className='army_property'>
                <span id="army_type1_text"> {unitName}: </span>
                <span id="army_type1_value"> {amount} </span>
              </div>
              <div className='army_property'>
                <span id="army_soft1_text"> Damage: </span>
                <span id="army_soft1_value"> {units[unitType]['damage_low']}-{units[unitType]['damage_high']} </span>
              </div>
              <div className='army_property'>
                <span id="army_hard1_text"> Piercing: </span>
                <span id="army_hard1_value"> {units[unitType]['piercing']} </span>
              </div>
              <div className='army_property'>
                <span id="army_hardness1_text"> Hardness: </span>
                <span id="army_hardness1_value"> {units[unitType]['hardness']*100}% </span>
              </div>
              <div className='army_property'>
                <span id="army_hp_text"> HP: </span>
                <span id="army_hp_value"> {units[unitType]['hp']} </span>
              </div>
            </div>
        </>
    );

    const listOfUnits = [];
    for (let u in units) {
      if (provProp[u] != null) {
        listOfUnits.push(<ArmyListItem 
          unitType={units[u].type}
          unitName={units[u].name}
          amount={provProp[u]}
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