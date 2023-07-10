import './Army.css';  

export default function Army( {name, provinceNumber, slotNumber, exists, ownsArmy, onArmyClick, armyObject}) {

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
    
      // Stop dragging animation when dropping the element
      const handleDragEnd = (e) => {
        e.target.classList.remove('drag_army_start');
      };
    

    return (
        <button className='province_army' id={name} style={{opacity: armyVisibility}} draggable={armyDraggable} 
        onClick={() => onArmyClick(armyObject)} onDragStart={(e) => handleOnDrag(e, armyObject, provinceNumber, slotNumber)} 
        onDragEnd={(e) => handleDragEnd(e)} >{name}</button>
    );
}