import './Footer.css';  
import { useState } from 'react';
import RaiseArmy from './RaiseArmy';
import ProvinceBuild from './ProvinceBuild';
import FootArmyView from './FootArmyView';
import FootUpgradeView from './FootUpgradeView';
import FootBattleView from './FootBattleView';

/**
 * @param {Function} onBuyUpgrade
 * @param {Function} onSplitArmy
 * @param {Function} fetchResourceUpgrades
 * @param {Function} getArmies
 * @param {JSON} properties: All properties of the currently selected province/army
 * @param {JSON} session: All information of the current game session (see Session in backend)
 * @param {JSON} upgrades:
 * @param {JSON} player: Player information (see Player in backend)
 * @param {Integer} slotIndex: Which index the player has in game session
 * 
 * @returns 
 */
export default function Footer( {
  onSelectAction,
  onBuyUpgrade,
  onSplitArmy,
  fetchResourceUpdates,
  pushPendingData,
  getArmies,
  properties,
  session, 
  upgrades,
  player,
  slotIndex} ) {

  const [provProp, setProvProp] = useState(properties);
  const [useRaiseMenu, setuseRaiseMenu] = useState(false);
  const [useBuildMenu, setUseBuildMenu] = useState('none');
  const [footerType, setFooterType] = useState('province');
  const constructionInit = Array(session.world_size).fill(null).map(() => ({ type: "", value: 0 }));
  const [constructing, setConstructing] = useState(constructionInit);
  
  // For deactivating menus
  const makeSliderInactive = () => {setuseRaiseMenu(false)};  
  const makeBuildInactive  = () => {setUseBuildMenu('none')};
  
  // When clicking the "raise army" button
  const onRaiseArmyMenu = () => { setuseRaiseMenu(!useRaiseMenu); };
  // When clicking on a building
  function onBuildMenu(setBuildingType) {
    if (useBuildMenu === setBuildingType) {
      setUseBuildMenu('none')  
    } else {
      setUseBuildMenu(setBuildingType);
    }
  }
  
  // Only change properties if they have actually changed
  if (properties !== provProp) {
    // Reset building states
    const constructingCopy = [... constructing];
    for (let i = 0; i < constructing.length; i++) {
      if (constructingCopy[i].type != '') {
        if (provProp[constructingCopy[i].type] > constructingCopy[i].value) {
          constructingCopy[i].type = '';
        }
      }
    }
    setConstructing(constructingCopy);
    // Change province property and reset sliders and buildmenues
    makeSliderInactive();
    makeBuildInactive();
    setProvProp(properties);
  }

  function raiseArmyAction(newProvinceInfo) {
    onRaiseArmyMenu();
    fetchResourceUpdates();
    onSelectAction(newProvinceInfo, 'army');
  }

  function buildMenuAction(province, buildingType) {
    const eventPackage = {
      type: 'building',
      text: buildingType,
      provinceID: province._id,
      provinceN: province.id
    }
    const constructingCopy = [... constructing];
    if (constructing[provProp.id].type == '') {
      constructingCopy[provProp.id].type = buildingType;
      constructingCopy[provProp.id].value = provProp[buildingType];
      setConstructing(constructingCopy);
    } else {
      constructingCopy[provProp.id].type = '';
      setConstructing(constructingCopy);
    }
    pushPendingData(eventPackage);
  }

  // Whether to show properties for a province or an army
  if (properties['soldiers'] != null) {
    if (footerType !== 'army') {
      setFooterType('army');
    }
  } else if (properties['type'] == 'upgrade') {
    if (footerType !== 'upgrade') {
      setFooterType('upgrade');
    }
  } else if (properties['performance'] != null) {
    if (footerType !== 'battle') {
      setFooterType('battle');
    }
  } else {
    if (footerType !== 'province') {
      setFooterType('province');
    }
  } 

  // The buttons for constucting buildings
  function BuildingButtons() {
    return (
      <div className='footer_row'>
        {player.name === properties.owner && (
          <>
          <button className={(constructing[provProp.id].type == 'houses') ? 'property_button_constructing' : 'property_button'} 
            onClick={() => onBuildMenu('houses')} >
            <span id="name6"> Houses: </span>
            <span id="value6"> {provProp['houses']} </span>
          </button>

          <button className={(constructing[provProp.id].type == 'mines') ? 'property_button_constructing' : 'property_button'}  
            onClick={() => onBuildMenu('mines')} >
            <span id="name7"> Mines: </span>
            <span id="value7"> {provProp['mines']} </span>
          </button>

          <button className={(constructing[provProp.id].type == 'workshops') ? 'property_button_constructing' : 'property_button'}  
            onClick={() => onBuildMenu('workshops')} >
            <span id="name8"> Workshops: </span>
            <span id="value8"> {provProp['workshops']} </span>
          </button>

          <button className={(constructing[provProp.id].type == 'farms') ? 'property_button_constructing' : 'property_button'} 
            onClick={() => onBuildMenu('farms')}>
            <span id="name9"> Farms: </span>
            <span id="value9"> {provProp['farms']} </span>
          </button>

          <button className={(constructing[provProp.id].type == 'forts') ? 'property_button_constructing' : 'property_button'} 
            onClick={() => onBuildMenu('forts')} >
            <span id="name11"> Fortifications: </span>
            <span id="value11"> {provProp['forts']} </span>
          </button>
          </>
      )}
      {player.name !== properties.owner && (
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
    {(footerType === 'province') && (
      <div className="footer">

      <RaiseArmy 
        setInactive={makeSliderInactive}
        onRaiseArmy={raiseArmyAction}
        active={useRaiseMenu} 
        fromProvince = {provProp}
        upgrades={upgrades} 
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
        constructing={constructing}
      />

      <div className='footer_row'>
        <div className='property_name'>
          <span id="name1"> Province: </span>
          <span id="value1"> {provProp['name']} </span>
        </div>
        <div className='property_name'>
          <span id="name44"> Terrain: </span>
          <span id="value44"> {provProp['terrain']} </span>
        </div>
        <div className='property_name'>
          <span id="name1b"> Owner: </span>
          <span id="value1b"> {provProp['owner']} </span>
        </div>
        <div className='property'>
          <span id="name10"> Workforce: </span>
          <span id="value10"> {provProp['workforce']} </span>
        </div>

        {(player.name === properties.owner && properties.enemy_army == null) && (
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

  return (
    <>
    <FooterProvince /> 
    {(footerType === 'army') && (
      <FootArmyView 
        onSplitArmy={onSplitArmy}
        provProp={{... provProp}} 
        upgrades={upgrades}
        isOwner={player.name === properties.owner} 
        getArmies={getArmies} /> 
    )}
    {(footerType === 'upgrade') && (
      <FootUpgradeView 
        provProp={{... provProp}} 
        onBuyUpgrade={onBuyUpgrade} 
        session={session} 
        slotIndex={slotIndex} /> 
    )}
    {(footerType === 'battle') && (
      <FootBattleView 
        properties={{... provProp}}  /> 
    )}
    </>
  );
}


