import './Province.css';  
import Army from './ArmySlot.js'
import { armyAttack } from '../../functionality/manageArmies';

import image_mountains from "../../graphics/prov_mountains.png";
import image_mountains_rad from "../../graphics/prov_mountains_rad.png";
import image_forest from "../../graphics/prov_forest.png";
import image_forest_rad from "../../graphics/prov_forest_rad.png";
import image_swamp from "../../graphics/prov_swamp.png";
import image_swamp_rad from "../../graphics/prov_swamp_rad.png";
import image_urban from "../../graphics/prov_urban.png";
import image_urban_rad from "../../graphics/prov_urban_rad.png";
import image_plains_rad from "../../graphics/prov_plain_rad.png";
import image_swords from "../../graphics/swords.gif";

/**
 * Component for provinces in the main view. 
 * Logic for clicking on a province, an army and drag and drop for armies
 *  
 * !! Does not contain the data for each province, that is handled by the db
 */

export default function Province(
  { id, onProvinceClick, onArmyClick, onMoveArmy, onMergeArmies, onBattleClick,
    name, owner, flavor, terrain, armies, session, player, battle}) {
  // If start dragging an army  

  // Setup province colors and set color for each player
  const playerNames = session.slot_names;
  const playerColors = {'Neutral': allColors[4]};
  // TODO: This seem extremely ineffective to run all the time
  for (let i = 0; i < session.max_slots; i++) {
    const currentPlayer = playerNames[i];
    playerColors[currentPlayer] = (session.slot_ids[i] == null) ? 'white' : allColors[i];
  }

  // Set color of current province
  const color = playerColors[owner];

  /**
   * @brief: Dropping an army on a province
   * 
   * @param {*} e: The HTML element of the army
   * @param {*} toProvince: What province number it is being dropped in
   */
  function handleOnDrop(e, toProvince){
    const whatArmy = e.dataTransfer.getData("whatArmy");
    const fromProvince   = e.dataTransfer.getData("fromProvince");
    const fromSlot   = e.dataTransfer.getData("fromSlot");

    onMoveArmy(fromProvince, toProvince, whatArmy, fromSlot);
  }
  
  function handleDragOver(e){
      e.preventDefault();
  }

  function handleMergeArmies(army1, army2) {
    onMergeArmies(army1, army2, id);
  }

  const width = {9: 285, 16: 235, 25: 185};
  const height = {9: 270, 16: 220, 25: 170};

  const provImage = {
    'plain': (flavor != 'radiation') ? null : image_plains_rad, 
    'forest': (flavor != 'radiation') ? image_forest : image_forest_rad, 
    'mountain': (flavor != 'radiation') ? image_mountains : image_mountains_rad, 
    'swamp': (flavor != 'radiation') ? image_swamp : image_swamp_rad, 
    'urban': (flavor != 'radiation') ? image_urban : image_urban_rad
  };
  
  return (
      <div className='province' id={id} owner={owner} 
        style={{'background-color': color, backgroundImage: `url(${provImage[terrain]})`, 
          width: width[session.world_size], height: height[session.world_size]}} 
        onDragOver={handleDragOver} onDrop={(e) => {handleOnDrop(e, id)}}>
      
      <button className='province_name' onClick={onProvinceClick}>{name}</button>
      <Army key={name + '_army1'} name='army1' provinceNumber={id} slotNumber={0} exists={armies[0] != null} 
        ownsArmy={player.name == owner} onArmyClick={onArmyClick} armyObject={armies[0]} onMergeArmies={handleMergeArmies} />
      <Army key={name + '_army2'} name='army2' provinceNumber={id} slotNumber={1} exists={armies[1] != null} 
        ownsArmy={player.name == owner} onArmyClick={onArmyClick} armyObject={armies[1]} onMergeArmies={handleMergeArmies} />
      <Army key={name + '_army3'} name='army3' provinceNumber={id} slotNumber={2} exists={armies[2] != null} 
        ownsArmy={player.name == owner} onArmyClick={onArmyClick} armyObject={armies[2]} onMergeArmies={handleMergeArmies} />
      <Army key={name + '_army4'} name='army4' provinceNumber={id} slotNumber={3} exists={armies[3] != null} 
        ownsArmy={player.name == owner} onArmyClick={onArmyClick} armyObject={armies[3]} onMergeArmies={handleMergeArmies} />
      {battle && (
        <img src={image_swords} alt={"battle icon"} className="province_battle_icon" onClick={() => onBattleClick(id)} />
      )}
      </div>
      
  );
}

// Pre-defined colors to use for provinces
const allColors = ["rgb(135, 245, 66)", "rgb(219, 78, 46)", "rgb(194, 85, 224)", 
"rgb(82, 212, 217)", "rgb(216, 217, 167)"];
