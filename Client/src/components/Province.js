import './Province.css';  

/**
 * Component for provinces in the main view. 
 * Logic for clicking on a province, an army and drag and drop for armies
 *  
 * !! Does not contain the data for each province, that is handled by the db
 */

export default function Province({ id, onProvinceClick, onArmyClick, name, owner, armies, moveArmy}) {
  // If start dragging an army  
  function handleOnDrag(e, whatArmy, fromProvince, fromSlot){
      //e.originalEvent.dataTranfser.setData("widgetType", widgetType);
      e.dataTransfer.setData("whatArmy", whatArmy);
      e.dataTransfer.setData("fromProvince", fromProvince);
      e.dataTransfer.setData("fromSlot", fromSlot);
    }
  
    // If dropping an army in a province
    function handleOnDrop(e, toProvince){
      const whatArmy = e.dataTransfer.getData("whatArmy");
      const fromProvince   = e.dataTransfer.getData("fromProvince");
      const fromSlot   = e.dataTransfer.getData("fromSlot");

      moveArmy(fromProvince, toProvince, whatArmy, fromSlot);
    }
   
    function handleDragOver(e){
      e.preventDefault();
    }
  
    const playerColors = {
      Player1: "rgb(135, 245, 66)",
      Player2: "rgb(219, 78, 46)",
      Player3: "rgb(194, 85, 224)",
      Player4: "rgb(82, 212, 217)",
      Neutral: "rgb(216, 217, 167)"
    };
  
    const color = playerColors[owner];
    // If an army exists in a slot, show that it exists and make it draggable
    const army1Exists = (armies[0] == null) ? 0.2 : 1.0;
    const army2Exists = (armies[1] == null) ? 0.2 : 1.0;
    const army3Exists = (armies[2] == null) ? 0.2 : 1.0;
    const army4Exists = (armies[3] == null) ? 0.2 : 1.0;
    const army1Draggable = (armies[0] == null) ? false : true;
    const army2Draggable = (armies[1] == null) ? false : true;
    const army3Draggable = (armies[2] == null) ? false : true;
    const army4Draggable = (armies[3] == null) ? false : true;
    
    return (
        <div className='province' id={id} owner={owner} style={{background: color}} 
          onDragOver={handleDragOver} onDrop={(e) => {handleOnDrop(e, id)} }>
        
        <button className='province_name' onClick={onProvinceClick}>{name}</button>
        
        <button className='province_army' id='army1' style={{opacity: army1Exists}} draggable={army1Draggable} 
          onClick={() => onArmyClick(armies[0])} onDragStart={(e) => handleOnDrag(e, armies[0], id, 0)} >Army 1</button>
        <button className='province_army' id='army2' style={{opacity: army2Exists}} draggable={army2Draggable}
          onClick={() => onArmyClick(armies[1])} onDragStart={(e) => handleOnDrag(e, armies[1], id, 1)} >Army 2</button>
        <button className='province_army' id='army3' style={{opacity: army3Exists}} draggable={army3Draggable}
          onClick={() => onArmyClick(armies[2])} onDragStart={(e) => handleOnDrag(e, armies[2], id, 2)} >Army 3</button>
        <button className='province_army' id='army4' style={{opacity: army4Exists}} draggable={army4Draggable}
          onClick={() => onArmyClick(armies[3])} onDragStart={(e) => handleOnDrag(e, armies[3], id, 3)} >Army 4</button>
        </div>
    );
  }
  