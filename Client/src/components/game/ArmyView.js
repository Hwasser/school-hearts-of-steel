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
                <span id="army_soft1_text"> Soft Attack: </span>
                <span id="army_soft1_value"> {units[unitType]['soft_attack']} </span>
              </div>
              <div className='army_property'>
                <span id="army_hard1_text"> Hard Attack: </span>
                <span id="army_hard1_value"> {units[unitType]['hard_attack']} </span>
              </div>
              <div className='army_property'>
                <span id="army_hardness1_text"> Hardness: </span>
                <span id="army_hardness1_value"> {units[unitType]['hardness']}% </span>
              </div>
              <div className='army_property'>
                <span id="army_hp_text"> HP: </span>
                <span id="army_hp_value"> {units[unitType]['hp']} </span>
              </div>
            </div>
        </>
    );

    const militiaAmount = (provProp.militia           == null) ? 0 : provProp.militia; 
    const dmAmount      = (provProp.demolition_maniac == null) ? 0 : provProp.demolition_maniac; 
    const gnAmount      = (provProp.gun_nut           == null) ? 0 : provProp.gun_nut; 
    const ftAmount      = (provProp.fortified_truck   == null) ? 0 : provProp.fortified_truck; 
    const psAmount      = (provProp.power_suit        == null) ? 0 : provProp.power_suit; 
    const raiderAmount  = (provProp.raider            == null) ? 0 : provProp.raider; 

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
            </div>

            {militiaAmount > 0 && (
              <ArmyListItem 
                  unitType={'militia'}
                  unitName={'Militia'}
                  amount={militiaAmount}
              />
            )}
            {dmAmount > 0 && (
              <ArmyListItem 
                  unitType={'demolition_maniac'}
                  unitName={'Demolition Maniac'}
                  amount={dmAmount}
              />
            )}
            {gnAmount > 0 && (
              <ArmyListItem 
                  unitType={'gun_nut'}
                  unitName={'Gun Nut'}
                  amount={gnAmount}
              />
            )}
            {ftAmount > 0 && (
              <ArmyListItem 
                  unitType={'fortified_truck'}
                  unitName={'Fortified Truck'}
                  amount={ftAmount}
              />
            )}
            {psAmount > 0 && (
              <ArmyListItem 
                  unitType={'power_suit'}
                  unitName={'Power Suit'}
                  amount={psAmount}
              />
            )}
            {raiderAmount > 0 && (
              <ArmyListItem 
                  unitType={'raider'}
                  unitName={'Raider'}
                  amount={raiderAmount}
              />
            )}

          </div>
          </>
    );
}