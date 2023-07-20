import axios from 'axios';
import { initUpgrades } from '../upgradeStats';
const { units } = require('../unitStats');

/**
 * All action for the armies such as move, attack, battle, conquer etc
 */


/** @brief: Moves army between two provinces
 * 
 *  @param {Integer} fromProvince: Which province number to move from
 *  @param {Integer} toProvince: Which province number to move to
 *  @param {String} army: The Document Id of the army to move
 *  @param {Integer} fromSlot: Which slot in the province it moves from
 *  @param {[[String]]} armiesCopy: A copy of the state of all army slots in all provinces
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
 *  @param {Integer} fromProvince: Which province number to attack from
 *  @param {Integer} toProvince: Which province number to attack to
 *  @param {String} army: The Document Id of the army to attack
 *  @param {Integer} fromSlot: Which slot in the province it attacks from
 *  @param {JSON} session: Contains the game session
 *  @param {JSON} upgrades: All the upgrades of the attacker
 *  @param {[[String]]} armiesCopy: A copy of the state of all army slots in all provinces
 *  @returns {String} The new owner of the province, empty string if no change 
 */
export async function armyAttack(fromProvince, toProvince, army, fromSlot, session, upgrades, armiesCopy) {
    // Fetch data of the attacking army
    const attackingArmy  = await fetchArmy(army);
    const battleProvince = await getBattleProvince(toProvince);
    const enemyUpgrades  = await getEnemyUpgradeTree(battleProvince.owner, session);
    
    // Manage army slots of source province
    rearrangeSourceSlots(fromProvince, fromSlot, armiesCopy);

    // Iterate through all enemy army slots, perform battle at each slot
    for (let i = 3; i >= 0; i--) {
        if (armiesCopy[i][toProvince] != null) {
            const defendingArmy = await fetchArmy(armiesCopy[i][toProvince]);
            const result = performBattle(attackingArmy, defendingArmy, battleProvince, upgrades, enemyUpgrades);
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
 *         from the array. Damage is modified by the enemies hardness,
 *         piercing damage go right through the armor. Terrain modifies
 *         the total damage of the attacker and defender. Forts reduces
 *         attackers damage by 10% by fort level.
 * 
 * @param {JSON} attackingArmy: An Army object from the MongoDB data base 
 * @param {JSON} defendingArmy An Army object from the MongoDB data base
 * @param {String} terrain: The terrain of the province - affects battle!
 * @param {JSON} attackerUpgrades The upgrade tree of the attacker
 * @param {JSON} defenderUpgrades The upgrade tree of the defender
 * @returns {String} What the outcome is, "win", "lose" or "draw"
 */
function performBattle(attackingArmy, defendingArmy, battleProvince, attackerUpgrades, defenderUpgrades) {
    // Get terrain and the number of forts in the province, since this affect outcome
    const terrain = battleProvince.terrain;
    const forts   = battleProvince.forts;
    
    // Set up an array of troops of all different kinds and put them in an array
    // VARIANT: 6 soldiers, 4 militia och 2 raiders:
    //          [militia][militia][militia][militia][raider][raider]
    //          each cell containing an entry from units in the unitStats-file
    let attackingArmyTroops = setUpSoldiers(attackingArmy, attackerUpgrades);
    let defendingArmyTroops = setUpSoldiers(defendingArmy, defenderUpgrades);
    
    // While at least one side has troops left, continue the battle
    let round = 1;
    while (attackingArmyTroops.length > 0 && defendingArmyTroops.length > 0) {
        // Let both sides attack
        for (let i = 0; i < attackingArmyTroops.length; i++) {
            const attackMod = attackingArmyTroops[i]['attack_mod'][terrain];
            performAttack(attackingArmyTroops, defendingArmyTroops, i, attackMod, forts);
        }
        for (let i = 0; i < defendingArmyTroops.length; i++) {
            const defenceMod = defendingArmyTroops[i]['defence_mod'][terrain];
            performAttack(defendingArmyTroops, attackingArmyTroops, i, defenceMod, 0);
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
 * @param {Float} mod: The damage modifier related to terrain 
 * @param {Integer} forts: The forts in the battle province 
 */
function performAttack(attacker, attacked, n, mod, forts) {
    const soldier = attacker[n];
    const enemyNumber = Math.floor(Math.random()*attacked.length)
    // Damage (for example 6-10 means random damage between 6 and 10)
    const damage = soldier.damage_low + Math.random()*(soldier.damage_high - soldier.damage_low);
    // How much damage can actually go through the armor
    const inflictedDamage = damage * (1-attacked[enemyNumber].hardness) + soldier.piercing;
    // Change enemy hp depending on terrain modifier
    attacked[enemyNumber].hp -= Math.round(inflictedDamage * (mod - forts*0.10));
}

/**
 * @brief: Sets up array of units, representing an army during battle
 * 
 * @param {JSON} army: The MongoDB document object for the army
 * @param {JSON} upgrades: The upgrade tree beloning to the owner of the army
 * @returns {Array}: An array of units, each one represented by an object from imported "units"
 */
function setUpSoldiers(army, upgrades) {
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
    // Apply upgrades to armies
    const upgradedDamage = 1 + upgrades['upg_weap2_dam'] * 0.1 + upgrades['upg_weap3_dam'] * 0.1;
    const upgradedArmor  = 0 + upgrades['upg_weap2_arm'] * 10 + upgrades['upg_weap3_arm'] * 10;  
    for (let i = 0; i < army.soldiers; i++) {
        armySoldiers[i].hardness += upgradedArmor;
        armySoldiers[i].damage_low *= upgradedDamage;
        armySoldiers[i].damage_high *= upgradedDamage;
        armySoldiers[i].piercing *= upgradedDamage;
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

async function getBattleProvince(id) {
    let province = null;
    await axios.get('http://localhost:8082/api/provinces/', {
        params: { id: id}
    })
    .then( (res) => {
        province = res.data[0];
    })
    .catch( (e) => {
        console.log(e)
    });

    return province;
}

/**
 * @brief: If the enemy is a player, return its upgrade tree, 
 *         otherwise return a default upgrade tree
 * 
 * @param {String} enemyName: The name of the enemy player 
 * @param {JSON} session: The current game session
 * @returns An upgrade tree
 */
async function getEnemyUpgradeTree(enemyName, session) {
    const enemySlot =  session.slot_names.findIndex( (e) => e == enemyName);
    if (enemySlot >= 0) {
        return await getUpgradeTree(session.upgrades[enemySlot]);
    } else {
        return {...initUpgrades};
    }
}

async function getUpgradeTree(upgradeId) {
    let upgradeTree = {};
    await axios
    .get(`http://localhost:8082/api/upgrades/${upgradeId}`)
        .then((res) => {
        upgradeTree = res.data;
        })
        .catch((err) => {
        console.log('Failed adding player to session:', err.response);
    });
    return upgradeTree;

}