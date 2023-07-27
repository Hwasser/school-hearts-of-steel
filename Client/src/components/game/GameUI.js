/**
 * This component represent playfield between the header and footer, 
 * including all provinces. 
 * 
 * Children: Proinvce.js, ArmySlot.js
 */

import axios from 'axios';
import Province from './Province';
import React, { useState } from 'react';  
import './GameUI.css';
import {
  postMovement} 
    from '../../functionality/pendingActions';

export default function GameUI( 
  {onSelectAction, onMergeArmies,
    names, owners, flavors, terrains, provinceId, armies, session, player, battle} ) {
  
  const worldRowSize = Math.sqrt(session.world_size);
  const [mergeConfirmation, setMergeConfirmation] = useState(false);
  const [mergeState, setMergeState] = useState(null);

 /**
  * @param {Integer} index: The province number 
  */
  function handleSelectProvince(index) {
    axios.get('http://localhost:8082/api/provinces/', {
      params: { purpose: "get_by_n", id: index}
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
  function handleSelectArmy(id) {
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
   * 
   * @param {Integer} number: Which battle is selected
   */
  function handleSelectBattle(number) {
    onSelectAction(battle[number]);
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
 */
  function handleMoveArmy(fromProvince, toProvince, army) {
  if (fromProvince == toProvince) {
    return;
  }

  // Check if destination province is neightbour from this province
  const move = fromProvince - toProvince; 
  if (Math.abs(move) == worldRowSize 
    || (move == -1 &&  (fromProvince % worldRowSize != worldRowSize-1))
    || (move == 1 && (fromProvince % worldRowSize != 0)) ) {
      const province1 = provinceId[fromProvince];
      const province2 = provinceId[toProvince];
      // Check if the destination province is ours or belongs to another player
      if (owners[toProvince] == owners[fromProvince]) {
        // Only start moving an army if there are any available army slots in dst!
        if (armies[0][toProvince] == null 
          || armies[1][toProvince] == null 
          || armies[2][toProvince] == null 
          || armies[3][toProvince] == null) {      
          console.log("move army " + army + " from province " + fromProvince + " to " + toProvince);
          postMovement(province1, province2, session, player, army)

        } else {
          console.log("No available army slots in that province!");
        }
      // If the province is not ours, attack!
      } else {
        console.log("attack with army " + army + " from province " + fromProvince + " to " + toProvince);
        postMovement(province1, province2, session, player, army)
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
      for (let i = 0; i < worldRowSize; i++) {
          let listItems = []
          // Build a row of provinces
          for (let j = 0; j < worldRowSize; j++) {
            const index = i * worldRowSize + j;
            const name = names[index];
            const owner = owners[index];
            const flavor = flavors[index];
            const terrain = terrains[index];
            const curBattle = battle[index];
            // Armies in province -> provArmies[slot][province index]
            const provArmies = [armies[0][index], armies[1][index], armies[2][index], armies[3][index]]
              listItems.push(<Province 
                id={index} 
                onProvinceClick={ () => handleSelectProvince(index) }
                onBattleClick={handleSelectBattle}
                onArmyClick={handleSelectArmy}
                onMoveArmy={handleMoveArmy}
                onMergeArmies={handleMergeArmies}
                owner={owner}
                flavor={flavor}
                terrain={terrain}
                name={name} 
                armies={provArmies}
                session={session}
                player={player}
                battle={curBattle}
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
