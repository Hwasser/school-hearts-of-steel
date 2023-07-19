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
  
    function handleBuyUpgrade(upgrade) {
      if (canAfford) {
        onBuyUpgrade(upgrade)
      }
    }
  
    return (
      <>
        <div className="footer">
          <div className='footer_row'>
              <div className='property_name'>
                <span key="upg_name1"> Upgrade: </span>
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
              <button className='property_button' onClick={() => handleBuyUpgrade(provProp['data'])} > Purchase </button>
            </div>
            <div className='footer_row'>
              <div className='property_name'>
                <span key="upg_value6"> {provProp['text']} </span>
              </div>
            </div>
        </div>
      </>
    );
  }
  