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
  const province1 = await Province.findOne({_id: event.province});
  const province2 = await Province.findOne({_id: event.province2});

  const isAttacking = (province2.owner == event.player.name) ? false : true;
  if (!isAttacking) {
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
    }
  } else {
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
      // Move enemy army into their province
      province2.enemy_army = event.army_id;
      console.log("ATTACKING");
      broadcastAttackArmy(province1, province2)
    }
  }
  province1.save();
  province2.save();
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

