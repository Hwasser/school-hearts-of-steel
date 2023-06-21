import axios from 'axios';
import './GameUI.css';
import Province from './components/Province';
import React, { useEffect } from 'react';  

export default function GameUI( {onSelectAction, updateArmies, names, owners, objectIds, army1, army2, army3, army4} ) {
  const worldSize = 3;

  function onSelectProvince(index) {
    axios.get('http://localhost:8082/api/provinces/', {
      params: { id: index}
    })
    .then( (res) => {
      if (res.data.length !== 0) {
          onSelectAction(res.data[0]);
      }
    })
    .catch( (e) => {
      console.log(e)
    });
  }

  function onMoveArmy(fromProvince, toProvince, army, fromSlot) {
    if (fromProvince == toProvince) {
      return;
    }

    // Get the document id from both source and destination
    const fromId = Number(objectIds[fromProvince]);
    const toId = Number(objectIds[toProvince]);
    
    // Check if destination province is neightbour from this province
    if (Math.abs(fromProvince - toProvince) == 1
      || Math.abs(fromProvince - toProvince) == worldSize) {
        // Only start moving an army if there are any available army slots!
        if (owners[toProvince] == owners[fromProvince]) {
          if (army1[toProvince] == null 
            || army2[toProvince] == null 
            || army3[toProvince] == null 
            || army4[toProvince] == null) {      
            console.log("move army " + army + " from province " + fromProvince + " to " + toProvince);
            updateArmies(fromProvince, fromId, toProvince, toId, army, fromSlot, false);
          } else {
            console.log("No available army slots in that province!");
          }
        } else {
          console.log("attack with army " + army + " from province " + fromProvince + " to " + toProvince);
          updateArmies(fromProvince, fromId, toProvince, toId, army, fromSlot, true);
        }
      } else {
        console.log("Province is too far away!");
      }
  }

  function BuildBody() {
      const body = [];
      for (let i = 0; i < worldSize; i++) {
          let listItems = []
          for (let j = 0; j < worldSize; j++) {
            const index = i * worldSize + j;
            const name = names[index];
            const owner = owners[index];
            const objectId = objectIds[index];
            const armies = [army1[index], army2[index], army3[index], army4[index]]
              // TODO: click-function just placeholder
              listItems.push(<Province 
                id={index} 
                key={index}
                onProvinceClick={ () => onSelectProvince(index) }
                owner={owner}
                name={name} 
                armies={armies}
                moveArmy={onMoveArmy}
              />);
          }
          body.push(<div className='world_row'> {listItems} </div>);
      }
      return body;
  }


  return (
    <>
    <div className="main_screen">
        <BuildBody />
    </div>
    </>
  );
}



