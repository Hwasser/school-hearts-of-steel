/**
 * Module contains all army related in the backend.
 * 
 * All pending events are being fired in the backend and thus will occur even
 * if the player accidently refreshes or closes the browser.
 * 
 * Battles also occur 100% is the backend and the result from each tick
 * is broadcasted to the players.
 */

const Upgrade = require('./models/Upgrade');
const Session = require('./models/Session');
const Province = require('./models/Province');
const Army = require('./models/Army');

const { 
    broadcastMoveArmy, 
    broadcastAttackArmy,
    broadcastAttackBattle,
    broadcastUpdateProvince,
    broadcastHasWon, 
    broadcastMergeArmies} = require('./broadcast');
const { initUpgrades } = require('./GameData/upgradeStats');
const { units } = require('./GameData/unitStats');

// ------------------------ MOVE/ATTACK-related ---------------------------


/** Representation of each battle
 * 
 * key: province._id
 * values:
 *  {
    province: {... battleProvince},
    session: session._id
    attackerUpgrades: {... attackerUpgrades},
    defenderUpgrades: {... defenderUpgrades},
    attackingArmy: {... attackingArmy},
    defendingArmy: {... defendingArmy},
    attackingArmyTroops: attackingArmyTroops,
    defendingArmyTroops: defendingArmyTroops,
    round: 0
    }
 */
let battles = {};

/**
 * @brief At each time tick, iterate and perform all battles.
 *        Battle of round = 0 has not started yet.
 * @param {String} id: A game session id 
 */
async function iterateBattles(id) {
  // This represents all battles that has ended after this round
  const endedBattles = [];
  // Iterate all battles
  for (let b in battles) {
    const battle = battles[b];
    // Check whether this battle is part of the session that tries to process it
    if (battle.session.toString() == id.toString()) {
      // This is the execution of battle round
      const result = await performBattle(battle);
      // If the player won against an army (there can be multiple armies in a province)
      if (result == 'win') {
        console.log("Won!");
        // Delete the current defender army
        await Army.deleteOne({_id: battle.defendingArmy._id});
        // If they have more armies, continue the battle
        if (battle.province.armies.length > 1) {
          console.log("Battle continues!");
          // Delete the defender army from the province and update battle.province
          const updatedProvince = await Province.findOneAndUpdate( 
            { _id: battle.province._id},
            { $pull: {
              armies: battle.defendingArmy._id }},
            { new: true }
            );
          battle.province = updatedProvince;
          await continueBattle(battle);
        } else { // 
          // .. otherwise complete the battle and declare attacker winner
          await Province.findOneAndUpdate( 
            { _id: battle.province._id},
            { $set: {
              owner: battle.attackingArmy.owner,
              armies: [battle.attackingArmy._id],
              enemy_army: null
            }},
            { new: true }
          );
          // And update the attacker army due to causalities
          await battle.attackingArmy.save();
          endedBattles.push(b);
        }
      } else if (result == 'lose') {
        // Kill player army and update province without attacker army in it
        console.log("Lose!");
        await Army.deleteOne({_id: battle.province.enemy_army});
        await Province.findOneAndUpdate( 
          { _id: battle.province._id},
          { $set: {
            enemy_army: null
          }},
          { new: true }
        );
        // Update the defending army to show causalities
        battle.defendingArmy.save();
        endedBattles.push(b);
      } else if (result == 'draw') {
        // Kill both armies
        console.log("Draw!");
        // Remove both armies
        await Army.deleteOne({_id: battle.defendingArmy._id});
        await Army.deleteOne({_id: battle.attackingArmy._id});
        // And update the province
        await Province.findOneAndUpdate( 
          { _id: battle.province._id},
          { $set: {
            armies: [],
            enemy_army: null
          }},
          { new: true }
        );
        endedBattles.push(b);
      }
    }
  }

  // Remove all ended battles
  for (let i = 0; i < endedBattles.length; i++) {
    delete battles[endedBattles[i]];
  }
}

/**
 * @brief: Terminate all battles of a certain game session
 * 
 * @param {String} id: A game session id 
 */
async function terminateAllBattles(id) {
  console.log("iterateBattles");
  const endedBattles = [];
  for (let b in battles) {
    const battle = battles[b];
    if (battle.session.toString() == id.toString()) {
      delete battles[b];
    }
  }
}


/**
 * 
 * @param {JSON} event: A pending action event
 */
async function attackOrMoveArmy(event) {
  // Fetch provinces from database
  const province1 = await Province.findOne({_id: event.provinceID});
  const province2 = await Province.findOne({_id: event.province2ID});

  const isAttacking = (province1.owner == province2.owner) ? false : true;
  if (!isAttacking) {
    await moveArmy(event, province1, province2);
  } else {
    await attackArmy(event, province1, province2);
  }
}

async function moveArmy(event, province1, province2) {
  // Cannot move into a full province
  if (province2.armies.length < 4) {
    // Filter out the army from the "FROM"-province
    await Province.findOneAndUpdate( 
      { _id: province1._id},
      { $pull: {
        armies: event.army_id
      }},
      { new: true }
      );
    // Push the army to the "TO"-province
    await Province.findOneAndUpdate( 
      { _id: province2._id},
      { $push: {
        armies: event.army_id
      }},
      { new: true }
      );
    }
}

async function attackArmy(event, province1, province2) {
  // Only attack if there are no other enemies in their province
  if (province2.enemy_army == null) { 
    // Filter out the army from the "FROM"-province
    await Province.findOneAndUpdate( 
      { _id: province1._id},
      { $pull: {
        armies: event.army_id
      }},
      { new: true }
      );
    // If their province has no armies, simply switch owners and move in army
    if (province2.armies.length == 0) {
      await Province.findOneAndUpdate( 
        { _id: province2._id},
        { $set: {
          armies: [event.army_id],
          owner: province1.owner
        }},
        { new: true }
      );
    } else {
      // .. otherwise move army into their province
      const updatedProvince2 = await Province.findOneAndUpdate( 
        { _id: province2._id},
        { $set: { enemy_army: event.army_id }},
        { new: true }
      );
      findBattle(event, province1, updatedProvince2);
    }
  } 
}

async function findBattle(event, fromProvince, battleProvince) {
  // Get session and session slots
  const gameSession = await Session.findOne({_id: event.session});
  const attackerSlot = gameSession.slot_names.findIndex( (e) => e == fromProvince.owner);
  const defenderSlot = gameSession.slot_names.findIndex( (e) => e == battleProvince.owner);
  // Get upgrades of both sides
  const attackerUpgrades = await Upgrade.findOne({_id: gameSession.upgrades[attackerSlot]});
  // If the defender is a neutral province, get the generic tech tree
  const defenderUpgrades = (defenderSlot >= 0)
    ? await Upgrade.findOne({_id: gameSession.upgrades[defenderSlot]})
    : {...initUpgrades};
  // Get the attackers army data
  const attackingArmy  = await Army.findOne({_id: event.army_id});
  // Get the defenders army data
  const getEnemy = battleProvince.armies.slice(-1).pop();
  const defendingArmy = await Army.findOne({_id: getEnemy});
  // Set up troops in each army
  let attackingArmyTroops = setUpSoldiers(attackingArmy, attackerUpgrades);
  let defendingArmyTroops = setUpSoldiers(defendingArmy, defenderUpgrades);

  // Start a battle
  const battle = {
    province: battleProvince,
    session: event.session,
    attackerUpgrades: attackerUpgrades,
    defenderUpgrades: defenderUpgrades,
    attackingArmy: attackingArmy,
    defendingArmy: defendingArmy,
    attackingArmyTroops: attackingArmyTroops,
    defendingArmyTroops: defendingArmyTroops,
    round: 0
  };
  battles[battleProvince._id] = battle;
  // Calculate how the battle is going and broadcast to all players
  const performance = calculatePerformance(battle);
  broadcastAttackBattle(
    battleProvince, 
    attackingArmyTroops.length, 
    defendingArmyTroops.length, 
    performance);
  
}

async function continueBattle(battle) {
  console.log("CONINTUE BATTLE!"); // TODO: REMOVE
  // Get the defenders next army data
  const getEnemy = battle.province.armies.slice(-1).pop();
  const defendingArmy = await Army.findOne({_id: getEnemy});
  // Set up new army
  let defendingArmyTroops = setUpSoldiers(defendingArmy, defenderUpgrades);
  battle.defendingArmyTroops = defendingArmyTroops;
  // Reset round in new battle
  battle.round = 0;
  // Calculate how the battle is going and broadcast to all players
  const performance = calculatePerformance(battle);
  broadcastAttackBattle(
    battle.province, 
    attackingArmyTroops.length, 
    defendingArmyTroops.length, 
    performance);
}

async function performBattle(battle) {
  // Get terrain and the number of forts in the province, since this affect outcome
  const terrain = battle.province.terrain;
  const forts   = battle.province.forts;

  // Let both sides attack
  for (let i = 0; i < battle.attackingArmyTroops.length; i++) {
      const attackMod = battle.attackingArmyTroops[i]['attack_mod'][terrain];
      performAttack(battle.attackingArmyTroops, battle.defendingArmyTroops, i, attackMod, forts);
  }
  for (let i = 0; i < battle.defendingArmyTroops.length; i++) {
      const defenceMod = battle.defendingArmyTroops[i]['defence_mod'][terrain];
      performAttack(battle.defendingArmyTroops, battle.attackingArmyTroops, i, defenceMod, 0);
  }
  // After the attacks, kill all units with HP < 0
  battle.attackingArmyTroops = battle.attackingArmyTroops.filter(e => e.hp > 0);
  battle.defendingArmyTroops = battle.defendingArmyTroops.filter(e => e.hp > 0); 

  // Count survivors in both armies
  const attackLeft  = countSurvivors(battle.attackingArmy, battle.attackingArmyTroops);
  const defenceLeft = countSurvivors(battle.defendingArmy, battle.defendingArmyTroops);
  // Update both armies
  battle.attackingArmy.soldiers = attackLeft;
  battle.defendingArmy.soldiers = defenceLeft;

  if (battle.attackingArmyTroops.length == 0 || battle.defendingArmyTroops.length == 0) {
    if (attackLeft == defenceLeft) {
        return 'draw';
    }
    if (attackLeft < defenceLeft) {
        return 'lose';
    }
    if (attackLeft > defenceLeft) {
        return 'win';
    }
  } else {
    battle.round += 1;
    // Calculate how the battle is going and broadcast to all players
    const performance = calculatePerformance(battle);
    broadcastAttackBattle(
      battle.province, 
      battle.attackingArmyTroops.length, 
      battle.defendingArmyTroops.length, 
      performance);
    return '';
  }


   console.log("ERROR! This should never happen!");}

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
  let enemyNumber = Math.round(Math.random()*(attacked.length-1))
  // Damage (for example 6-10 means random damage between 6 and 10)
  const damage = soldier.damage_low + Math.random()*(soldier.damage_high - soldier.damage_low);
  // How much damage can actually go through the armor
  const inflictedDamage = damage * (1-attacked[enemyNumber].hardness) + soldier.piercing;
  // Change enemy hp depending on terrain modifier
  attacked[enemyNumber].hp -= Math.round(inflictedDamage * (mod - forts*0.10));
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
          delete army[u]; 
      } else {
          army[u] = troopsLeft.length;
          soldiers += troopsLeft.length;
      }
  }
  return soldiers;
}

/**
 * @brief: Iterate through both armies and calculate how the battle is going 
 * 
 * @param {Dict} battle 
 * @returns A float number indicating the performance, perf < 1 if attacker is losing
 */
function calculatePerformance(battle) {
  const attackers = battle.attackingArmyTroops; 
  const defenders = battle.defendingArmyTroops; 
  const terrain = battle.province.terrain; 
  const fort = battle.province.forts;

  let attackPerf = 0;
  let defendPerf = 0;
  for (let i = 0; i < attackers.length; i++) {
    const unit = attackers[i];
    attackPerf += Math.log10((unit.damage_low + unit.damage_high + unit.piercing * 2
    + unit.hardness * 25) * unit.hp * unit.attack_mod[terrain] * ((10-fort)*0.1));
  }
  for (let i = 0; i < defenders.length; i++) {
    const unit = defenders[i];
    defendPerf += Math.log10((unit.damage_low + unit.damage_high + unit.piercing * 2
      + unit.hardness * 25) * unit.hp * unit.attack_mod[terrain] * ((10-fort)*0.1));
  }

  return attackPerf / defendPerf;
}

/**
 * @brief: Sets up array of units, representing an army during battle
 * 
 * VARIANT: 6 soldiers, 4 militia och 2 raiders:
 *          [militia][militia][militia][militia][raider][raider]
 *          each cell containing an entry from units in the unitStats-file
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
  const upgradedArmor  = 0 + upgrades['upg_weap2_arm'] * 0.1 + upgrades['upg_weap3_arm'] * 0.1;  
  for (let i = 0; i < army.soldiers; i++) {
      armySoldiers[i].hardness += upgradedArmor;
      armySoldiers[i].damage_low *= upgradedDamage;
      armySoldiers[i].damage_high *= upgradedDamage;
      armySoldiers[i].piercing *= upgradedDamage;
  }

  return armySoldiers;
}
  
/**
 * @brief: Check whether a player has won. The rule is that if one player
 * has defeated all all player he/she has won.
 */
async function hasWon() {
  const allProvinces = await Province.find({});
  // There will always be a player who owns province 0
  const firstOwner = allProvinces[0].owner;
  for (let i = 1; i < allProvinces.length; i++) {
    const province = allProvinces[i];
    // Ignore neutral provinces, you only need to defeat all players to win!
    if (province.owner == 'Neutral') {
      continue;
    }
    // If there is another player that owns territory, no one has won!
    if (firstOwner != province.owner) {
      return;
    }
  }
  broadcastHasWon(firstOwner);  
}


// ------------------------ OTHER ---------------------------
 

/**
 * 
 * @param {JSON} updatePackage 
 */
async function mergeArmies(updatePackage) {
  // Get data of both armies
  const army1Document = await Army.findOne({_id: updatePackage.army1});
  const army2Document = await Army.findOne({_id: updatePackage.army2});
  if (!army1Document || !army2Document) {
    console.log('mergeArmies failed! One army is missing!');
    return;
  }
  // Merge armies into army1
  army1Document.soldiers += army2Document.soldiers;
  mergeSoldierTypes(army1Document, army2Document);
  await army1Document.save(); 
  // Remove the merged army (army 2)
  await Army.deleteOne({_id: updatePackage.army2});
  // Update the armies in the province
  const provinceId = updatePackage.provinceId;
  const provinceDocument = await Province.findOneAndUpdate( 
    { _id: provinceId},
    { $pull: {
      armies: updatePackage.army2
    }},
    { new: true }
    );
  broadcastMergeArmies(provinceDocument);
}

/**
* @brief: Merge every single soldier type in the army
* @param {JSON} army1: Army1 document object
* @param {JSON} army2: Army2 document object
*/
function mergeSoldierTypes(army1, army2) {
  if (army2.militia != null) {
      army1.militia = (army1.militia == null) 
          ? army2.militia : army1.militia + army2.militia;
  }
  if (army2.demolition_maniac != null) {
      army1.demolition_maniac = (army1.demolition_maniac == null) 
          ? army2.demolition_maniac : army1.demolition_maniac + army2.demolition_maniac;
  }
  if (army2.gun_nut != null) {
      army1.gun_nut = (army1.gun_nut == null) 
          ? army2.gun_nut : army1.gun_nut + army2.gun_nut;
  }
  if (army2.fortified_truck != null) {
      army1.fortified_truck = (army1.fortified_truck == null) 
          ? army2.fortified_truck : army1.fortified_truck + army2.fortified_truck;
  }
  if (army2.power_suit != null) {
      army1.power_suit = (army1.power_suit == null) 
          ? army2.power_suit : army1.power_suit + army2.power_suit;
  }
}

module.exports = { 
    mergeArmies,
    attackOrMoveArmy,
    iterateBattles,
    terminateAllBattles
};

