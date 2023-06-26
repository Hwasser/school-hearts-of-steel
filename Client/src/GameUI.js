import axios from 'axios';
import './GameUI.css';
import Province from './components/Province';
import React, { useEffect } from 'react';  

export default function GameUI( {onSelectAction, updateArmies, names, owners, objectIds, armies} ) {
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

  function onSelectArmy(id) {
    if (id == null) {
      return;
    }

    axios.get(`http://localhost:8082/api/armies/${id}` )
    .then( (res) => {
      onSelectAction(res.data);
    })
    .catch( (e) => {
      console.log(e)
    });
  }

  function onMoveArmy(fromProvince, toProvince, army, fromSlot) {
    if (fromProvince == toProvince) {
      return;
    }

    // Check if destination province is neightbour from this province
    const move = fromProvince - toProvince; 
    if (Math.abs(move) == worldSize 
      || (move == -1 &&  (fromProvince % worldSize != worldSize-1))
      || (move == 1 && (fromProvince % worldSize != 0)) ) {
        // Check if the destination province is ours or belongs to another player
        if (owners[toProvince] == owners[fromProvince]) {
          // Only start moving an army if there are any available army slots in dst!
          if (armies[0][toProvince] == null 
            || armies[1][toProvince] == null 
            || armies[2][toProvince] == null 
            || armies[3][toProvince] == null) {      
            console.log("move army " + army + " from province " + fromProvince + " to " + toProvince);
            updateArmies(fromProvince, toProvince, army, fromSlot, false);
          } else {
            console.log("No available army slots in that province!");
          }
        // If the province is not ours, attack!
        } else {
          console.log("attack with army " + army + " from province " + fromProvince + " to " + toProvince);
          updateArmies(fromProvince, toProvince, army, fromSlot, true);
        }
      } else {
        console.log("Province is too far away!");
      }
  }

  function BuildBody() {
      const body = [];
      // Build all provinces of the map
      for (let i = 0; i < worldSize; i++) {
          let listItems = []
          // Build a row of provinces
          for (let j = 0; j < worldSize; j++) {
            const index = i * worldSize + j;
            const name = names[index];
            const owner = owners[index];
            // Armies in province -> provArmies[slot][province index]
            const provArmies = [armies[0][index], armies[1][index], armies[2][index], armies[3][index]]
              // TODO: click-function just placeholder
              listItems.push(<Province 
                id={index} 
                key={index}
                onProvinceClick={ () => onSelectProvince(index) }
                onArmyClick={onSelectArmy}
                owner={owner}
                name={name} 
                armies={provArmies}
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



