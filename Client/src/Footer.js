import './Footer.css';  
import RaiseArmy from './components/RaiseArmy';
import ProvinceBuild from './components/ProvinceBuild';
import { useState } from 'react';

export default function Footer( {properties, onRaiseArmy, onBuildBuilding, session, slotIndex, player} ) {

  const [provProp, setProvProp] = useState(properties);
  const [useRaiseMenu, setuseRaiseMenu] = useState(false);
  const [useBuildMenu, setUseBuildMenu] = useState('none');
  const [isProvince, setIsProvince] = useState(true);
  
  // For deactivating menus
  const makeSliderInactive = () => {setuseRaiseMenu(false)};  
  const makeBuildInactive  = () => {setUseBuildMenu('none')};
  
  // When clicking the "raise army" button
  const onRaiseArmyMenu = () => { setuseRaiseMenu(!useRaiseMenu); };
  // When clicking on a building
  function onBuildMenu(setBuildingType) {
    if (useBuildMenu == setBuildingType) {
      setUseBuildMenu('none')  
    } else {
      setUseBuildMenu(setBuildingType);
    }
  }
  
  // Only change properties if they have actually changed
  if (properties != provProp) {
    setProvProp(properties);
    makeSliderInactive();
    makeBuildInactive();
  }

  function raiseArmyAction(newProvinceInfo) {
    setProvProp(newProvinceInfo); 
    onRaiseArmyMenu();
    onRaiseArmy(newProvinceInfo)
  }

  function buildMenuAction(newProvinceInfo) {
    setProvProp(newProvinceInfo);
    onBuildBuilding()
  }

  // Whether to show properties for a province or an army
  if (properties['soldiers'] == null) {
    if (isProvince == false) {
      setIsProvince(true);
    }
  } else {
    if (isProvince == true) {
      setIsProvince(false);
    }
  }

  // The buttons for constucting buildings
  function BuildingButtons() {
    return (
      <div className='footer_row'>
        {player.name == properties.owner && (
          <>
          <button className='property_button' onClick={() => onBuildMenu('house')} >
            <span id="name6"> Houses: </span>
            <span id="value6"> {provProp['houses']} </span>
          </button>

          <button className='property_button' onClick={() => onBuildMenu('mine')} >
            <span id="name7"> Mines: </span>
            <span id="value7"> {provProp['mines']} </span>
          </button>

          <button className='property_button' onClick={() => onBuildMenu('workshop')} >
            <span id="name8"> Workshops: </span>
            <span id="value8"> {provProp['workshops']} </span>
          </button>

          <button className='property_button' onClick={() => onBuildMenu('farm')}>
            <span id="name9"> Farms: </span>
            <span id="value9"> {provProp['farms']} </span>
          </button>

          <button className='property_button' onClick={() => onBuildMenu('fort')} >
            <span id="name11"> Fortifications: </span>
            <span id="value11"> {provProp['forts']} </span>
          </button>
          </>
      )}
      {player.name != properties.owner && (
          <>
          <div className='property_button_inactive'>
            <span id="name6"> Houses: </span>
            <span id="value6"> {provProp['houses']} </span>
          </div>

          <div className='property_button_inactive'>
            <span id="name7"> Mines: </span>
            <span id="value7"> {provProp['mines']} </span>
          </div>

          <div className='property_button_inactive'>
            <span id="name8"> Workshops: </span>
            <span id="value8"> {provProp['workshops']} </span>
          </div>

          <div className='property_button_inactive'>
            <span id="name9"> Farms: </span>
            <span id="value9"> {provProp['farms']} </span>
          </div>

          <div className='property_button_inactive'>
            <span id="name11"> Fortifications: </span>
            <span id="value11"> {provProp['forts']} </span>
          </div>
          </>
      )}
      
        </div>
    );
  }

  const FooterProvince = () => (
    <>
    {isProvince && (
      <div className="footer">

      <RaiseArmy 
        active={useRaiseMenu} 
        setInactive={makeSliderInactive}
        fromProvince = {provProp}
        onRaiseArmy={raiseArmyAction} 
        session={session}
        slotIndex={slotIndex}
      /> 

      <ProvinceBuild 
        buildingType={useBuildMenu}
        setInactive={makeBuildInactive}
        fromProvince={provProp}
        onBuildMenu={buildMenuAction}
        session={session}
        slotIndex={slotIndex}
      />

      <div className='footer_row'>
        <div className='property_name'>
          <span id="name1"> Province: </span>
          <span id="value1"> {provProp['name']} </span>
        </div>
        <div className='property_name'>
          <span id="name1b"> Owner: </span>
          <span id="value1b"> {provProp['owner']} </span>
        </div>
        <div className='property'>
          <span id="name10"> Manpower: </span>
          <span id="value10"> {provProp['workforce']} </span>
        </div>

        {player.name == properties.owner && (
          <button 
            className='property_button'
              onClick={onRaiseArmyMenu}
            >
            <span id="name12"> Raise Army </span>
          </button>
      )}
        
      </div>

      <BuildingButtons />
  
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
    )}
    </>
  );

  const FooterArmy = () => (
    <>
    {!isProvince && (
      <div className="footer">

        <div className='footer_row'>
          <div className='property_name'>
            <span id="name21"> Army owner: </span>
            <span id="value21"> {provProp['owner']} </span>
          </div>
        </div>
        <div className='footer_row'>
          <div className='property_name'>
            <span id="name23"> Soldiers: </span>
            <span id="value23"> {provProp['soldiers']} </span>
          </div>
        </div>
        <div className='footer_row'>
          <div className='property_name'>
            <span id="name25"> Placeholder: </span>
            <span id="value25"> .. more stuff </span>
          </div>
        </div>
      </div>
      )}
      </>
    );


  return (
    <>
    <FooterProvince /> 
    <FooterArmy /> 
    </>
  );
}

