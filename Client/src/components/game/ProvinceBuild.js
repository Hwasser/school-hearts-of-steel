/**
 * Module for the build-menu within a province - that is when you want to build a farm etc
*/
import './ProvinceBuild.css';
import { useState } from 'react';  
import axios from 'axios';
import {host} from '../../backend_adress';
const { buildings } = require('../../GameData/provinceStats');

export default function ProvinceBuild(
    { buildingType, setInactive, fromProvince, onBuildMenu, session, slotIndex, constructing} ) {
    const [errorMessage, setErrorMessage] = useState('');
    
    // The currently selected building, if we have arleady selected a construction of 
    // another building that one will be used
    let selected = 'none';
    if (buildingType != 'none') {
        if (constructing[fromProvince.id]['type'] == '') {
            selected = buildingType;
        } else {
            selected = constructing[fromProvince.id]['type'];
        }
    }
    // The current and max level of the selected building in the state
    const currentLevel = fromProvince[selected];
    const maxLevel = 5;

    // The current cost of constructing a new level. The cost depends on a base cost
    // and a growth cost for each level.
    const curCost = {
        food: buildings[selected]['cost']['food'] + buildings[selected]['growth']['food'] * currentLevel,
        fuel: buildings[selected]['cost']['fuel'] + buildings[selected]['growth']['fuel'] * currentLevel,
        material: buildings[selected]['cost']['material'] + buildings[selected]['growth']['material'] * currentLevel,
        tools: buildings[selected]['cost']['tools'] + buildings[selected]['growth']['tools'] * currentLevel
    }

    
    async function onConfirmButton() {
        const recentSession = await getSession(session._id);
        const canAffordRecent = checkCanAfford(curCost, recentSession, slotIndex)

        if (currentLevel >= maxLevel) {
            setErrorMessage("You cannot construct more buildings of that type in this province!");
            return;
        } else if (!canAffordRecent.all) {
            setErrorMessage("You cannot afford to construct this building!");
            return;           
        }
        onBuildMenu(fromProvince, selected, curCost, recentSession.time);
        setInactive();
        setErrorMessage('');
    }    

    function onCancelButton() {
        setInactive();
        setErrorMessage('');
    }    

    if (selected == 'none' && errorMessage != '') {
        setErrorMessage('');
    }    

    const toDraw = (selected != 'none') ? "inline" : "none";
    const canAfford = checkCanAfford(curCost, session, slotIndex)

    return (
        <>
        {errorMessage != '' && (
          <div className="build_error">
            <p>{errorMessage}</p>
            <button onClick={onCancelButton}>ok</button>
          </div>
        )}
        {
            errorMessage == '' && (
            <div className='build_building' style={{display: toDraw}}>
            {constructing[fromProvince.id].type == '' && (
                <>
                <h2 className='build_name'> Construct a {buildings[selected]['name']}</h2>
                <p className='build_desc'> {buildings[selected]['info']}</p>
                <h3 className='build_costs'>Requirements:</h3>
                <div className='cost_row'>
                    <div className='cost_field'> 
                    <span>Food:</span>
                    <span style={{color: (canAfford.food) ? 'black' : 'red'}}>
                        {curCost.food}</span> 
                    </div>
                    <div className='cost_field'> 
                    <span>Fuel:</span>
                    <span style={{color: (canAfford.fuel) ? 'black' : 'red'}}>
                        {curCost.fuel}</span> 
                    </div>
                </div>
                <div className='cost_row'>
                    <div className='cost_field'> 
                    <span>Tools:</span>
                    <span style={{color: (canAfford.tools) ? 'black' : 'red'}}>
                        {curCost.tools}</span> 
                    </div>
                    <div className='cost_field'> 
                    <span>Material:</span>
                    <span style={{color: (canAfford.material) ? 'black' : 'red'}}>
                        {curCost.material}</span> 
                    </div>
                </div>
                </>
            )}
            {constructing[fromProvince.id].type != '' && (
                <h2 className='build_desc'> Abort building! </h2>
            )}
                <button 
                    className='confirm_button'
                    onClick={() => {onConfirmButton()}} 
                > 
                Confirm
                </button>
                <button 
                    className='cancel_button'
                    onClick={() => {onCancelButton()}} 
                > 
                Cancel
                </button>
            </div>
          
        )    
        }
    </>
    );
}


/**
 * @param {String} id: The _id of a session 
 * @returns {JSON} session
 */
async function getSession(id) {
    let session = null;
    await axios
    .get(host + `/api/sessions/${id}`)
    .then((res) => {
        session = res.data;
    })
    .catch((err) => {
        console.log('Error in updating session: ' + err);
    });  
    return session;
}

/**
 * @brief: Check whether we can afford a building of curCost with current resources from session
 * 
 * @param {Dict} curCost 
 * @param {JSON} session 
 * @param {Integer} slotIndex 
 * @returns {Dict}
 */
function checkCanAfford(curCost, session, slotIndex) {
    // Whether we can afford this building
    const canAfford = {
        food:     curCost.food     <= session.food[slotIndex],
        fuel:     curCost.fuel     <= session.fuel[slotIndex],
        tools:    curCost.material <= session.tools[slotIndex],
        material: curCost.tools    <= session.material[slotIndex]
    };
    canAfford['all'] = canAfford.food && canAfford.fuel && canAfford.tools && canAfford.material;
    return canAfford;   
}