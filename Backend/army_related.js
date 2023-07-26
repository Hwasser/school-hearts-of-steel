/**
 * Module contains query-functions that are used in routes.
 */

const Province = require('./models/Province');
const Army = require('./models/Army');
const { 
    broadcastMoveArmy, 
    broadcastAttackArmy,
    broadcastHasWon, 
    broadcastMergeArmies} = require('./broadcast');
const { initUpgrades } = require('./GameData/upgradeStats');
const { units } = require('./GameData/unitStats');

let battles = {};

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
    // Store armies in province slots
    const provinceId = updatePackage.provinceId;
    const provinceDocument = await Province.findOne({id: provinceId});
    // Create a new army list for the province, excluding the removed one
    const provinceArmies = [];
    for (let i = 0; i < provinceDocument.armies.length; i++) {
      const army = provinceDocument.armies[i];
      if (updatePackage.army2 != army) {
        provinceArmies.push(army);
      }
    }
    provinceDocument.armies = provinceArmies;
    // Store and broadcast changes
    provinceDocument.save();
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

async function attackOrMoveArmy(event) {
  // Fetch provinces from database
  const province1 = await Province.findOne({_id: event.province});
  const province2 = await Province.findOne({_id: event.province2});

  const isAttacking = (province2.owner == event.player.name) ? false : true;
  if (!isAttacking) {
    moveArmy(event, province1, province2);
  } else {
    attackArmy(event, province1, province2);
  }
}

function moveArmy(event, province1, province2) {
  // Cannot move into a full province
  if (province2.armies.length < 4) {
    // Remove old army from province 1
    const province1Armies = [];
    for (let i = 0; i < province1.armies.length; i++) {
      if (province1.armies[i].toString() != event.army_id.toString()) {
        province1Armies.push(province1.armies[i]);
      }
    }
    province1.armies = province1Armies;
    // Move province into province 2
    province2.armies.push(event.army_id);
    broadcastMoveArmy(province1, province2) 

    province1.save();
    province2.save();
  }
}

async function attackArmy(event, province1, province2) {
  // Only attack if there are no other enemies in their province
  if (province2.enemy_army == null) { 
    // Remove old army from province 1
    const province1Armies = [];
    for (let i = 0; i < province1.armies.length; i++) {
      if (province1.armies[i].toString() != event.army_id.toString()) {
        province1Armies.push(province1.armies[i]);
      }
    }
    province1.armies = province1Armies;
    // If their province has no armies, simply switch owners and move in army
    if (province2.armies.length == 0) {
      province2.owner = province1.owner;
      province2.armies.push(event.army_id);
    } else {
      // .. otherwise move army into their province
      province2.enemy_army = event.army_id;
      findBattle(province1, province2)
    }
    province1.save();
    province2.save();
    broadcastAttackArmy(event, province1.owner, province2)
  } 
}

async function findBattle(event, attackerName, battleProvince) {
  // Get session and session slots
  const gameSession = await Session.findOne({_id: event.session});
  const attackerSlot = gameSession.slot_names.findIndex( (e) => e == attackerName);
  const defenderSlot = gameSession.slot_names.findIndex( (e) => e == battleProvince.owner);
  // Get upgrades of both sides
  const attackerUpgrades = await Upgrade.findOne({_id: gameSession.upgrades[attackerSlot]});
  // If the defender is a neutral province, get the generic tech tree
  const defenderUpgrades = (defenderSlot >= 0)
    ? await Upgrade.findOne({_id: gameSession.upgrades[defenderSlot]})
    : {...initUpgrades};
  // Get the attackers army data
  const attackingArmy  = await Province.findOne({_id: event.army_id});
  // Get the defenders army data
  const getEnemy = battleProvince.armies.slice(-1).pop();
  const defendingArmy = await Province.findOne({_id: event.army_id});
  // Set up troops in each army
  let attackingArmyTroops = setUpSoldiers(attackingArmy, attackerUpgrades);
  let defendingArmyTroops = setUpSoldiers(defendingArmy, defenderUpgrades);
  
  // Start a battle
  battles[battleProvince._id] = {
    battleProvince: {... battleProvince},
    attackerUpgrades: {... attackerUpgrades},
    defenderUpgrades: {... defenderUpgrades},
    attackingArmy: {... attackingArmy},
    defendingArmy: {... defendingArmy},
    attackingArmyTroops: attackingArmyTroops,
    defendingArmyTroops: defendingArmyTroops,
    round: 0
  };
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

  

module.exports = { 
    mergeArmies,
    attackOrMoveArmy
};

