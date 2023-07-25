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

/**
 * @brief: Move armies between provinces and store data to db and broadcast
 * 
 * @param {JSON} package: {from: number, to: number, armies: [[Army._id]], winner: string}
 *                        Contains the number of two provinces (from, to),
 *                        all armies in all province slots and who won in battle 
 * @param {String} purpose: Whether to attack or move
 */
async function attackOrMoveArmy(package, purpose) {
    const fromProvince = package.from;
    const toProvince = package.to;
    const armies     = package.armies;
    // Fetch provinces - Only update the two affected provinces
    const fromDocument = await Province.findOne({id: fromProvince});
    const toDocument   = await Province.findOne({id: toProvince});
  
    // Update provinces
    fromDocument.army1 = armies[0][fromProvince];
    fromDocument.army2 = armies[1][fromProvince];
    fromDocument.army3 = armies[2][fromProvince];
    fromDocument.army4 = armies[3][fromProvince];
    toDocument.army1 = armies[0][toProvince];
    toDocument.army2 = armies[1][toProvince];
    toDocument.army3 = armies[2][toProvince];
    toDocument.army4 = armies[3][toProvince];
    // Broadcast this information to the clients
    if (purpose == 'move_army') {
      broadcastMoveArmy(fromDocument, toDocument);
    } else {
      // If attacker won, change owner of the province
      if (package.winner != null) {
        toDocument.owner = package.winner;
      }
      broadcastAttackArmy(fromDocument, toDocument);
    }
    // Store the data to database
    await fromDocument.save();
    await toDocument.save();
    // If attacking, check if a player has won!
    if (purpose == 'attack_army') {
      hasWon();
    }
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

