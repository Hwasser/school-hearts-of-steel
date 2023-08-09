/**
 * This component represent playfield between the header and footer, 
 * including all provinces. 
 * 
 * Children: Proinvce.js, ArmySlot.js
 */

import React, { useState } from 'react';  
import axios from 'axios';
import Province from './Province';
import './GameUI.css';
import {setupMovement} 
    from '../../functionality/armyLogic';
import {host} from '../../backend_adress';

export default function GameUI( 
  {onSelectAction, onMergeArmies, pushPendingData, 
    names, owners, flavors, terrains, provinceId, armies, session, player, battle} ) {
  
  const worldRowSize = Math.sqrt(session.world_size);
  const [mergeConfirmation, setMergeConfirmation] = useState(false);
  const [mergeState, setMergeState] = useState(null);
  
  // Used to draw movements of the current player armies on the screen
  const [movements, setMovements] = useState({});
  for (let m in movements) {
    const slot = movements[m]['fromSlot'];
    const inProvince = movements[m]['from'];
    if (armies[slot][inProvince] != m) {
      delete movements[m];
    }
  }

 /**
  * @param {Integer} index: The province number 
  */
  function handleSelectProvince(index) {
    axios.get(host + '/api/provinces/', {
      params: { purpose: "get_by_n", id: index, session: session._id}
    })
    .then( (res) => {
      if (res.data.length !== 0) {
          onSelectAction(res.data[0], 'province');
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
    
    axios.get(host + `/api/armies/${id}` )
    .then( (res) => {
      onSelectAction(res.data, 'army');
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
    onSelectAction(battle[number], 'battle');
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
 * @brief: When dragging an army from one province to another on the screen
 * 
 * @param {Integer} fromProvince: Province number 
 * @param {Integer} toProvince: Province number 
 * @param {JSON} army: The object id (_id) of an army
 * @param {Integer} fromSlot: Which slot the army came from
 */
  function handleMoveArmy(fromProvince, toProvince, army, fromSlot) {
    setupMovement(fromProvince, toProvince, army, fromSlot, provinceId, armies, worldRowSize, owners, pushMovements);
  }
  
  function pushMovements(army, fromProvince, toProvince, fromSlot, pendingEventPackage) {
    // Push movements to screen
    const movementsCopy = {... movements};
    // Delete old movement graphics of army if possible
    delete movementsCopy[army];
    // Push new movement graphics
    if (fromProvince != toProvince) { // except if army is not moving, stop it!
      movementsCopy[army] = {from: fromProvince, to: toProvince, toName: names[toProvince], fromSlot: fromSlot};
    }
    setMovements(movementsCopy);
    // Push pending event to server
    pushPendingData(pendingEventPackage);
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
                key={"province"+index}
                provinceNumber={index} 
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
                movements={movements}
              />);
          }
          body.push(<div key={"provine_row" + i} className='world_row'> {listItems} </div>);
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
