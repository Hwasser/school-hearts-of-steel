import React from 'react';  

import './ArmySlot.css';  

export default function Army( 
  {provinceNumber, slotNumber, exists, ownsArmy, armyObject, onArmyClick, onMergeArmies}) {

    // If an army exists in a slot, show that it exists and make it draggable
    const armyVisibility = (exists) ? 1.0 : 0.2;
    const armyDraggable = (!exists || !ownsArmy) ? false : true;

    /**
     * @brief: When starting to drag an army
     * 
     * @param {*} e: The HTML element of the army
     * @param {*} whatArmy: The document _id of the army
     * @param {*} fromProvince: The province number this army is being dragged from
     * @param {*} fromSlot: The slot number this army is being dragged from
     */
    function handleOnDrag(e, whatArmy, fromProvince, fromSlot){

        e.target.classList.add('drag_army_start');
        
        //e.originalEvent.dataTranfser.setData("widgetType", widgetType);
        e.dataTransfer.setData("whatArmy", whatArmy);
        e.dataTransfer.setData("fromProvince", fromProvince);
        e.dataTransfer.setData("fromSlot", fromSlot);
      }

  /**
   * @brief: Dropping an army on another army
   * 
   * @param {*} e: The HTML element of the army
   * @param {*} toProvince: What province number it is being dropped in
   */
  function handleOnDrop(e, toArmyObject, toProvince){
    const whatArmy = e.dataTransfer.getData("whatArmy");
    const fromProvince   = e.dataTransfer.getData("fromProvince");
    const fromSlot   = e.dataTransfer.getData("fromSlot");

    if (whatArmy != toArmyObject && fromProvince == toProvince) {
      onMergeArmies(whatArmy, toArmyObject);
    }
  }
    
    // Stop dragging animation when dropping the element
    const handleDragEnd = (e) => {
      e.target.classList.remove('drag_army_start');
    };
    
  function handleDragOver(e){
    e.preventDefault();
  }

  const name = "army" + (slotNumber+1);
  const provinceId = "province" + provinceNumber + "_" + name; // ex: province0_army1
  const positionStart = 10;
  const positionOffset = 30;
  const position = positionStart + positionOffset * slotNumber;

  return (
      <button className='province_army' id={provinceId} style={{opacity: armyVisibility, top: position}} draggable={armyDraggable} 
      onClick={() => onArmyClick(armyObject)} onDragStart={(e) => handleOnDrag(e, armyObject, provinceNumber, slotNumber)} 
      onDragEnd={(e) => handleDragEnd(e)} onDragOver={handleDragOver} onDrop={(e) => {handleOnDrop(e, armyObject, provinceNumber)} }>{name}</button>
  );
}