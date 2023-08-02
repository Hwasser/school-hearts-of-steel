import axios from 'axios';
import { useState } from 'react';

import './FootUpgradeView.css';  

/**
 * @brief: The view when selecting an upgrade, shows info about the upgrade and a puchase button
 * 
 * @param {JSON}: All properties of the upgrade 
 * @param {Function}: The function buying an upgrade
 * @param {JSON}: The current game session
 * @param {Integer}: The slot index of the player within the session
 * @returns A React Component
 */
export default function FootUpgradeView({provProp, onBuyUpgrade, session, slotIndex}) {
    const canAffordFood      = provProp['costs']['food']  <= session.food[slotIndex];
    const canAffordTools     = provProp['costs']['tools'] <= session.tools[slotIndex];
    const canAffordFuel      = provProp['costs']['fuel']  <= session.fuel[slotIndex];
    const canAffordMaterial  = provProp['costs']['material']  <= session.material[slotIndex];
    const canAfford = canAffordFood && canAffordTools && canAffordFuel && canAffordMaterial; 
    
    const alreadyBought = provProp.status;
    const [canAffordMessage, setCanAffordMessage] = useState(true);

    function handleBuyUpgrade(upgrade) {
      if (canAfford && provProp.available) {
        updateSession(provProp['costs'], slotIndex, session._id);
        onBuyUpgrade(upgrade)
      } else {
        setCanAffordMessage(false);
      }
    }

  /**
   * @brief: A Component for a "you cannot afford this upgrade" screen
   * @returns A merge-popup-window
   */
  const PopupCannotPurchase = () => {
    const onAbortMerge = () => {
      setCanAffordMessage(true);
    } 
    // Whether cannot afford or doesnt have the required upgrade dependencies
    const text = (provProp.available) 
      ? 'You cannot afford this upgrade!'
      : 'You cannot purchase this upgrade yet!'
    
    return (
      <div className="popup_cannot_purchase">
      <h3>{text}</h3>
      <button className='popup_button' onClick={onAbortMerge}>Ok</button>
      </div>
    );
  };
  
    return (
      <>
        <div className="footer">
          <div className='footer_row'>
              <div className='property_name'>
                <span key="upg_value1"> {provProp['name']} </span>
              </div>
              <div className='property_name' style={{color: (canAffordFood) ? 'black' : 'firebrick'}}>
                <span key="upg_name2"> Food: </span>
                <span key="upg_value2"> {provProp['costs']['food']} </span>
              </div>
              <div className='property_name' style={{color: (canAffordFuel) ? 'black' : 'firebrick'}}>
                <span key="upg_name3"> Fuel: </span>
                <span key="upg_value3"> {provProp['costs']['fuel']} </span>
              </div>
              <div className='property_name' style={{color: (canAffordTools) ? 'black' : 'firebrick'}}>
                <span key="upg_name4"> Tools: </span>
                <span key="upg_value4"> {provProp['costs']['tools']} </span>
              </div>
              <div className='property_name' style={{color: (canAffordMaterial) ? 'black' : 'firebrick'}}>
                <span key="upg_name5"> Material: </span>
                <span key="upg_value5"> {provProp['costs']['material']} </span>
              </div>
              {!alreadyBought && (
                <button className='property_button' onClick={() => handleBuyUpgrade(provProp['data'])} > Purchase </button>
              )}
              {alreadyBought && (
                <button className='upgrade_bought'> Bought </button>
              )}
            </div>
            <div className='footer_row'>
              <div className='property_name'>
                <span key="upg_value6"> {provProp['text']} </span>
              </div>
            </div>
            <div className='footer_row'>
              <div className='property_progress'>
                <div id="upgrade_progress_bar" key="upg_value7"> Researched </div>
              </div>
            </div>
        </div>
        {!canAffordMessage && (<PopupCannotPurchase />)}
      </>
    );
  }
  
// Update the player resources in the session
function updateSession(curCost, slotIndex, sessionId) {
  // A package with data to send to the backend
  const updatePackage = {
    food: curCost['food'],
    fuel: curCost['fuel'],
    tools: curCost['tools'],
    material: curCost['material'],
    purpose: 'buy_stuff',
    slotIndex: slotIndex,
  };
  
  axios
  .put(`http://localhost:8082/api/sessions/${sessionId}`, updatePackage)
  .catch((err) => {
      console.log('Couldnt update the session: ' + err);
  });  
}