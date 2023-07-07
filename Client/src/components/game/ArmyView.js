import React from 'react';

export default function armyView({provProp}) {

    const ArmyListItem = ({armyType, amount, softAttack, hardAttack, hardness}) => (
        <>
        <div className='footer_row'>
              <div className='property_name'>
                <span id="army_type1_text"> {armyType}: </span>
                <span id="army_type1_value"> {amount} </span>
              </div>
              <div className='property_name'>
                <span id="army_soft1_text"> Soft Attack: </span>
                <span id="army_soft1_value"> {softAttack} </span>
              </div>
              <div className='property_name'>
                <span id="army_hard1_text"> Hard Attack: </span>
                <span id="army_hard1_value"> {hardAttack} </span>
              </div>
              <div className='property_name'>
                <span id="army_hardness1_text"> Hardness: </span>
                <span id="army_hardness1_value"> {hardness}% </span>
              </div>
            </div>
        </>
    );

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

            <ArmyListItem 
                armyType={'Militia'}
                amount={100}
                softAttack={10}
                hardAttack={1}
                hardness={0}
            />

          </div>
          </>
    );
}