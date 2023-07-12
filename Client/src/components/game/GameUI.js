import axios from 'axios';
import Province from './Province';
import React, { useState } from 'react';  
import './GameUI.css';

export default function GameUI( 
  {onSelectAction, onUpdateArmies, onMergeArmies, names, owners, armies, session, player} ) {
  
  const worldSize = 3; // Number of provinces per row
  const [mergeConfirmation, setMergeConfirmation] = useState(false);
  const [mergeState, setMergeState] = useState(null);

 /**
  * @param {Integer} index: The province number 
  */
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
  
  /**
   * 
   * @param {String} id: The object id (_id) of an army 
   */
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
  
  /**
   * @param {String} army1: The object id (_id) of an army
   * @param {String} army2: The object id (_id) of an army
   * @param {Integer} i: Province number 
   */
  function handleMergeArmies(army1, army2, id) {
    setMergeConfirmation(true);
    setMergeState({army1: army1, army2: army2, id: id});
  }

/**
 * 
 * @param {Integer} fromProvince: Province number 
 * @param {Integer} toProvince: Province number 
 * @param {JSON} army: The object id (_id) of an army
 * @param {Integer} fromSlot: The slot number from where the army came
 * @returns 
 */
  function handleMoveArmy(fromProvince, toProvince, army, fromSlot) {
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
          onUpdateArmies(fromProvince, toProvince, army, fromSlot, false);
        } else {
          console.log("No available army slots in that province!");
        }
      // If the province is not ours, attack!
      } else {
        console.log("attack with army " + army + " from province " + fromProvince + " to " + toProvince);
        onUpdateArmies(fromProvince, toProvince, army, fromSlot, true);
      }
    } else {
      console.log("Province is too far away!");
    }
  }

  /**
   * @brief: A Component for a "merge-armies" confirmation screen
   * @returns A merge-popup-window
   */
  const MergeConfirmation = () => {
    const onAbortMerge = () => {
      setMergeConfirmation(false);
    } 

    function onConfirmMerge() {
      onMergeArmies(mergeState.army1, mergeState.army2, mergeState.id);
      setMergeConfirmation(false);
    }
    
    return (
      <div className="mergeConfirmationPopup">
      <h3>Are you sure you want to merge these armies?</h3>
      <button onClick={onConfirmMerge}>Confirm</button>
      <button onClick={onAbortMerge}>Cancel</button>
      </div>
    );
  };

  /**
   * @brief: Builds the playfield between the header and footer, including all provinces.
   * @returns A GameUI body
   */
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
              listItems.push(<Province 
                id={index} 
                onProvinceClick={ () => onSelectProvince(index) }
                onArmyClick={onSelectArmy}
                onMoveArmy={handleMoveArmy}
                onMergeArmies={handleMergeArmies}
                owner={owner}
                name={name} 
                armies={provArmies}
                session={session}
                player={player}
              />);
          }
          body.push(<div className='world_row'> {listItems} </div>);
      }
      return body;
  }


  return (
    <>
    {mergeConfirmation && (
      <MergeConfirmation />
    )}
    <div className="main_screen">
        <BuildBody />
    </div>
    </>
  );
}
