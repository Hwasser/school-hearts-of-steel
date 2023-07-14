import axios from 'axios';
const { units } = require('../unitStats');

/**
 * All action for the armies such as move, attack, battle, conquer etc
 */


/** @brief: Moves army between two provinces
 * 
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
 * 
 *  @param (number) fromProvince: Which province number to attack from
 *  @param (number) toProvince: Which province number to attack to
 *  @param (string) army: The Document Id of the army to attack
 *  @param (number) fromSlot: Which slot in the province it attacks from
 *  @param (2d array of string) armiesCopy: A copy of the state of all army slots in all provinces
 *  @returns (string) The new owner of the province, empty string if no change 
 */
export async function armyAttack(fromProvince, toProvince, army, fromSlot, armiesCopy, terrains) {
    // Fetch data of the attacking army
    const attackingArmy = await fetchArmy(army);
    const terrain = terrains[toProvince]; // Terrain in the province we're attacking

    // Manage army slots of source province
    rearrangeSourceSlots(fromProvince, fromSlot, armiesCopy);

    // Iterate through all enemy army slots, perform battle at each slot
    for (let i = 3; i >= 0; i--) {
        if (armiesCopy[i][toProvince] != null) {
            const defendingArmy = await fetchArmy(armiesCopy[i][toProvince]);
            const result = performBattle(attackingArmy, defendingArmy, terrain);
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

/**
 * @brief: The sole function perfoming a battle between two armies!
 *         Each army get all their units in an array.
 *         The battle gets performed in round, each round both armies
 *         get to shoot at the same time. Each units takes a shot at 
 *         a random unit. After each round all dead units are removed
 *         from the array.
 * 
 * @param {JSON} attackingArmy: An Army object from the MongoDB data base 
 * @param {JSON} defendingArmy An Army object from the MongoDB data base
 * @param {String} terrain: The terrain of the province - affects battle!
 * @returns {String} What the outcome is, "win", "lose" or "draw"
 */
function performBattle(attackingArmy, defendingArmy, terrain) {
    let round = 1;

    // Set up an array of troops of all different kinds and put them in an array
    // VARIANT: 6 soldiers, 4 militia och 2 raiders:
    //          [militia][militia][militia][militia][raider][raider]
    //          each cell containing an entry from units in the unitStats-file
    let attackingArmyTroops = setUpSoldiers(attackingArmy);
    let defendingArmyTroops = setUpSoldiers(defendingArmy);
    
    // While at least one side has troops left, continue the battle
    while (attackingArmyTroops.length > 0 && defendingArmyTroops.length > 0) {
        // Let both sides attack
        for (let i = 0; i < attackingArmyTroops.length; i++) {
            const attackMod = attackingArmyTroops[i]['attack_mod'][terrain];
            performAttack(attackingArmyTroops, defendingArmyTroops, i, attackMod);
        }
        for (let i = 0; i < defendingArmyTroops.length; i++) {
            const defenceMod = defendingArmyTroops[i]['defence_mod'][terrain];
            performAttack(defendingArmyTroops, attackingArmyTroops, i, defenceMod);
        }
        // After the attacks, kill all units with HP < 0
        attackingArmyTroops = attackingArmyTroops.filter(e => e.hp > 0);
        defendingArmyTroops = defendingArmyTroops.filter(e => e.hp > 0); 

        round++;
    }
    // Count survivors in both armies
    const attackLeft  = countSurvivors(attackingArmy, attackingArmyTroops);
    const defenceLeft = countSurvivors(defendingArmy, defendingArmyTroops);
    // Update both armies
    attackingArmy.soldiers = attackLeft;
    defendingArmy.soldiers = defenceLeft;
    
    if (attackLeft == defenceLeft) {
        return 'draw';
    }
    if (attackLeft < defenceLeft) {
        return 'lose';
    }
    if (attackLeft > defenceLeft) {
        return 'win';
    }

     console.log("ERROR! This should never happen!");
}

/**
 * @brief: Count survivors, remove non existing army types and re-calculate n of soldiers
 * 
 * @param {JSON} army: The MongoDB document object for the army
 * @param {Array} troops: An array representing all units in the army 
 */
function countSurvivors(army, troops) {
    let soldiers = 0;
    // Iterate all types of troops and check how many is left
    for (let u in units) {
        const troopsLeft = troops.filter(e => e.type == u) 
        if (troopsLeft.length == 0) {
            delete army[u]; // TODO: Put null here instead?
        } else {
            army[u] = troopsLeft.length;
            soldiers += troopsLeft.length;
        }
    }
    return soldiers;
}

/**
 * @brief: A single unit shooting at an enemy 
 * 
 * @param {Array} attacker: An array of the attackers units
 * @param {Array} attacked: An array of the units of the attacked player 
 * @param {Integer} n: The number of the unit in the array 
 */
function performAttack(attacker, attacked, n, mod) {
    const soldier = attacker[n];
    const enemyNumber = Math.floor(Math.random()*attacked.length)
    // Damage (for example 6-10 means random damage between 6 and 10)
    const damage = soldier.damage_low + Math.round(Math.random()*(soldier.damage_high - soldier.damage_low));
    // How much damage can actually go through the armor
    const inflictedDamage = damage * (1-(attacked[enemyNumber].hardness/ 100)) + soldier.piercing;
    // Change enemy hp depending on terrain modifier
    attacked[enemyNumber].hp -= Math.round(inflictedDamage * mod);
}

/**
 * @brief: Sets up array of units, representing an army during battle
 * 
 * @param {JSON} army: The MongoDB document object for the army
 * @returns {Array}: An array of units, each one represented by an object from imported "units"
 */
function setUpSoldiers(army) {
    const armySoldiers = new Array(army.soldiers);
    let n = 0;
    // Add all army types to the list of troops
    if (army.militia != null) {
        for (let i = n; i < n + army.militia; i++) {
            armySoldiers[i] = {... units.militia};
        }
        n += army.militia;
    }
    if (army.demolition_maniac != null) {
        for (let i = n; i < n + army.demolition_maniac; i++) {
            armySoldiers[i] = {... units.demolition_maniac};
        }
        n += army.demolition_maniac;
    }
    if (army.gun_nut != null) {
        for (let i = n; i < n + army.gun_nut; i++) {
            armySoldiers[i] = {... units.gun_nut};
        }
        n += army.gun_nut;
    }
    if (army.fortified_truck != null) {
        for (let i = n; i < n + army.fortified_truck; i++) {
            armySoldiers[i] = {... units.fortified_truck};
        }
        n += army.fortified_truck;
    }
    if (army.power_suit != null) {
        for (let i = n; i < n + army.power_suit; i++) {
            armySoldiers[i] = {... units.power_suit};
        }
        n += army.power_suit;
    }
    if (army.raider != null) {
        for (let i = n; i < n + army.raider; i++) {
            armySoldiers[i] = {... units.raider};
        }
        n += army.raider;
    }
    if (army.mutant != null) {
        for (let i = n; i < n + army.mutant; i++) {
            armySoldiers[i] = {... units.mutant};
        }
        n += army.mutant;
    
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

// Update an army in the database
function updateArmy(army){
    const armyId = army['_id'];
    axios
        .put(`http://localhost:8082/api/armies/${armyId}`, army)
        .catch((err) => {
        console.log('Error in updating army: ' + err);
        });
}

/**
 * @brief: Post the result of an attack to the server 
 * 
 * @param {Integer} fromProvince: The province number of the province of the attacker
 * @param {Integer} toProvince: The province number of the attacked province
 * @param {JSON} armies: All armies on the screen after the war is ower
 * @param {String} player: The owner of the province the attack comes from 
 */
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

/**
 * @brief: Post the result of a movement to the server
 * 
 * @param {Integer} fromProvince: The province number to move from
 * @param {Integer} toProvince: The province number to move to
 * @param {JSON} armies: All armies on the screen after the movement
 */
function postMovement(fromProvince, toProvince, armies) {
    const postPackage = { from: fromProvince, to: toProvince, armies: armies};
    // Post changes in both provinces
    axios
    .put('http://localhost:8082/api/provinces', {package: postPackage, purpose: 'move_army'})
    .catch((err) => {
    console.log('Error in replacing armies in province: ' + err);
    });
}