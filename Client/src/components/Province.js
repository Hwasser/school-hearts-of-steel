import './Province.css';  

// TODO: Break out province to its own component
// TODO: We do not want armies as it is right now, it is ridiculous. Maybe eact province should have
// armyslots and max armyslots as integers and the armies as a list instead
export default function Province({ id, objectId, onProvinceClick, name, owner, armies, moveArmy}) {
    function handleOnDrag(e, whatArmy, fromId){
      //e.originalEvent.dataTranfser.setData("widgetType", widgetType);
      e.dataTransfer.setData("whatArmy", whatArmy);
      e.dataTransfer.setData("fromId", fromId);
    }
  
    function handleOnDrop(e, id){
      const whatArmy = e.dataTransfer.getData("whatArmy");
      const fromId   = e.dataTransfer.getData("fromId");

      moveArmy(fromId, id, whatArmy);
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
          onDragOver={handleDragOver} onDrop={(e) => {handleOnDrop(e, objectId)} }>
        
        <button className='province_name' onClick={onProvinceClick}>{name}</button>
        
        <button className='province_army' id='army1' style={{opacity: army1Exists}} draggable={army1Draggable} 
          onClick={() => 0} onDragStart={(e) => handleOnDrag(e, armies[0], objectId)} >Army 1</button>
        <button className='province_army' id='army2' style={{opacity: army2Exists}} draggable={army2Draggable}
          onClick={() => 0} onDragStart={(e) => handleOnDrag(e, armies[1], objectId)} >Army 2</button>
        <button className='province_army' id='army3' style={{opacity: army3Exists}} draggable={army3Draggable}
          onClick={() => 0} onDragStart={(e) => handleOnDrag(e, armies[2], objectId)} >Army 3</button>
        <button className='province_army' id='army4' style={{opacity: army4Exists}} draggable={army4Draggable}
          onClick={() => 0} onDragStart={(e) => handleOnDrag(e, armies[3], objectId)} >Army 4</button>
        </div>
    );
  }
  