import axios from 'axios';
const { units } = require('../unitStats');

/**
 * All action for the armies such as move, attack, battle, conquer etc
 */


/** @brief: Moves army between two provinces
 *  @param (number) fromProvince: Which province number to move from
 *  @param (number) toProvince: Which province number to move to
 *  @param (string) army: The Document Id of the army to move
 *  @param (number) fromSlot: Which slot in the province it moves from
 *  @param (2d array of string) armiesCopy: A copy of the state of all army slots in all provinces
 */
export async function armyMove(fromProvince, toProvince, army, fromSlot, armiesCopy) {
    // Manage army slots of source province
    rearrangeSourceSlots(fromProvince, fromSlot, armiesCopy);
 
    // Manage army slots of destination province
    for (let i = 0; i < 4; i++) {
        if (armiesCopy[i][toProvince] == null) {
            armiesCopy[i][toProvince] = army;
            break;
        }
    }

    // Replace armies in provinces in the database
    postMovement(fromProvince, toProvince, armiesCopy);
}


/** @brief: Makes an army attack a province
 *  @param (number) fromProvince: Which province number to attack from
 *  @param (number) toProvince: Which province number to attack to
 *  @param (string) army: The Document Id of the army to attack
 *  @param (number) fromSlot: Which slot in the province it attacks from
 *  @param (2d array of string) armiesCopy: A copy of the state of all army slots in all provinces
 *  @returns (string) The new owner of the province, empty string if no change 
 */
export async function armyAttack(fromProvince, toProvince, army, fromSlot, armiesCopy) {
    // Fetch data of the attacking army
    const attackingArmy = await fetchArmy(army);
    
    // Manage army slots of source province
    rearrangeSourceSlots(fromProvince, fromSlot, armiesCopy);

    // Iterate through all enemy army slots, perform battle at each slot
    for (let i = 3; i >= 0; i--) {
        if (armiesCopy[i][toProvince] != null) {
            const defendingArmy = await fetchArmy(armiesCopy[i][toProvince]);
            console.log("fetching done, starting attack:", i);
            const result = performBattle(attackingArmy, defendingArmy);
            if (result == 'win') {;
                console.log("won battle!", attackingArmy['soldiers'], "soldiers left");
                killArmy(defendingArmy['_id']);
                armiesCopy[i][toProvince] = null;
            }
            if (result == 'lose') {
                console.log("lost battle!");
                killArmy(attackingArmy['_id']);
                updateArmy(defendingArmy);
                break;
            }
            if (result == 'draw') {
                console.log("draw in battle!");
                killArmy(attackingArmy['_id']);
                killArmy(defendingArmy['_id']);
                armiesCopy[i][toProvince] = null;
                break;
            }
        }
    }

    // If the attacker survived, make sure he's been placed in the new province
    if (attackingArmy['soldiers'] > 0) {
        armiesCopy[0][toProvince] = army;
        updateArmy(attackingArmy);
        postAttack(fromProvince, toProvince, armiesCopy, attackingArmy['owner']);
        console.log(army, "won and will be moved to province.", "Soldiers left:", attackingArmy['soldiers']);
        return attackingArmy['owner'];
    } else {
        postAttack(fromProvince, toProvince, armiesCopy, null);
        return '';
    }
}

// Re-arrange the slots in the source province
function rearrangeSourceSlots(fromProvince, fromSlot, armiesCopy) {
    armiesCopy[fromSlot][fromProvince] = null;
    if (fromSlot < 3) {
        for (let i = 0; i < 3; i++) {
            if (armiesCopy[i][fromProvince] == null) {
                armiesCopy[i][fromProvince] = armiesCopy[i+1][fromProvince];
                armiesCopy[i+1][fromProvince] = null;
            }
        }
    }
}

function performBattle(attackingArmy, defendingArmy) {
    let round = 1;

    // Set up an array of troops of all different kinds and put them in an array
    // VARIANT: 6 soldiers, 4 militia och 2 raiders:
    //          [militia][militia][militia][militia][raider][raider]
    //          each cell containing an entry from units in the unitStats-file
    const attackingArmyTroops    = setUpSoldiers(attackingArmy);
    const defendingArmyTroops = setUpSoldiers(defendingArmy);

    // While at least one side has troops left, continue the battle
    while (attackingArmyTroops.length > 0 && defendingArmyTroops.length > 0) {
        // Let both sides attack
        for (let i = 0; i < attackingArmyTroops.length; i++) {
            performAttack(attackingArmyTroops, defendingArmyTroops, i);
        }
        for (let i = 0; i < defendingArmyTroops.length; i++) {
            performAttack(defendingArmyTroops, attackingArmyTroops, i);
        }
        // TODO: After the attacks, kill all units with HP < 0
        // ...
    }
    
    // TODO: After the battle, update both armies with the new number of troops
    /// ...

    // TODO: then return the state of the battle similar to below 
    /**
     if (attackingSoldiers == defendingSoldiers) {
         attackingArmy['soldiers'] = 0;
         defendingArmy['soldiers'] = 0;
         return 'draw';
     }
     if (attackingSoldiers < defendingSoldiers) {
         attackingArmy['soldiers'] = 0;
         defendingArmy['soldiers'] -= attackingSoldiers;
         return 'lose';
     }
     if (attackingSoldiers > defendingSoldiers) {
         defendingArmy['soldiers'] = 0;
         attackingArmy['soldiers'] -= defendingSoldiers;
         return 'win';
     }
     
     */
}

function performAttack(attacker, attacked, n) {
    const soldier = attacker[n];
    const enemyNumber = Math.floor(Math.random()*attacked.length)
    const enemy = attacked[enemyNumber];
    enemy.hp -=  soldier.soft_attack * (1-enemy.hardness) + soldier.hard_attack;
}

function setUpSoldiers(army) {
    const armySoldiers = new Array(army.soldiers);
    let n = 0;
    // Add all army types to the list of troops
    if (army.militia != null) {
        for (let i = n; n + army.militia; i++) {
            armySoldiers[i] = {... units.militia};
        }
        n += army.militia;
    }
    if (army.demolition_maniac != null) {
        for (let i = n; n + army.demolition_maniac; i++) {
            armySoldiers[i] = {... units.demolition_maniac};
        }
        n += army.demolition_maniac;
    }
    if (army.gun_nut != null) {
        for (let i = n; n + army.gun_nut; i++) {
            armySoldiers[i] = {... units.gun_nut};
        }
        n += army.gun_nut;
    }
    if (army.fortified_truck != null) {
        for (let i = n; n + army.fortified_truck; i++) {
            armySoldiers[i] = {... units.fortified_truck};
        }
        n += army.fortified_truck;
    }
    if (army.power_suit != null) {
        for (let i = n; n + army.power_suit; i++) {
            armySoldiers[i] = {... units.power_suit};
        }
        n += army.power_suit;
    }
    if (army.raider != null) {
        for (let i = n; n + army.raider; i++) {
            armySoldiers[i] = {... units.raider};
        }
        n += army.raider;
    }
    return armySoldiers;
}

// Remove army from database
function killArmy(armyId) {
    console.log("kill army:", armyId);
    axios
    .delete(`http://localhost:8082/api/armies/${armyId}`)
    .catch((err) => {
    console.log('Error in removing army ' + err);
    });
}

// Fetch army from database
async function fetchArmy(armyId) {
    let attackingArmy;
    await axios.get(`http://localhost:8082/api/armies/${armyId}` )
    .then( (res) => {
        attackingArmy = res.data;
    })
    .catch( (e) => {
        console.log("Error in armyAttack:", e)
    });
    return attackingArmy;
}

function updateArmy(army){
    const armyId = army['_id'];
    axios
        .put(`http://localhost:8082/api/armies/${armyId}`, army)
        .catch((err) => {
        console.log('Error in updating army: ' + err);
        });
}

function postAttack(fromProvince, toProvince, armies, player) {
    // If the attacker lost then just re-use the postMovement function
    if (player == null) {
        postMovement(fromProvince, toProvince, armies);
    }
    // Replace province owner if battle is won
    const postPackage = { from: fromProvince, to: toProvince, armies: armies, winner: player};
    // Post changes in both provinces
    axios
    .put('http://localhost:8082/api/provinces', {package: postPackage, purpose: 'attack_army'})
    .catch((err) => {
    console.log('Error in attack armies in province: ' + err);
    });
}

function postMovement(fromProvince, toProvince, armies) {
    const postPackage = { from: fromProvince, to: toProvince, armies: armies};
    // Post changes in both provinces
    axios
    .put('http://localhost:8082/api/provinces', {package: postPackage, purpose: 'move_army'})
    .catch((err) => {
    console.log('Error in replacing armies in province: ' + err);
    });
}