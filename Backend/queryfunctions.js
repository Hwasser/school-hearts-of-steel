

const Province = require('./models/Province');
const Army = require('./models/Army');

async function mergeArmies(updatePackage) {
    // Get data of both armies
    const army1Document = await Army.findOne({_id: updatePackage.army1});
    const army2Document = await Army.findOne({_id: updatePackage.army2});
    // Merge armies
    army1Document.soldiers += army2Document.soldiers;
    mergeSoldierTypes(army1Document, army2Document);
    await army1Document.save(); 
    // Remove the merged army
    await Army.deleteOne({_id: updatePackage.army2});
    console.log("333");
    // Store armies in province slots
    const armySlotPos = updatePackage.armySlotPos;
    const provinceId = updatePackage.provinceId;
    const provinceDocument = await Province.findOne({id: provinceId});
    provinceDocument.army1 = (armySlotPos.length > 0) ? armySlotPos[0] : null;
    provinceDocument.army1 = (armySlotPos.length > 1) ? armySlotPos[1] : null;
    provinceDocument.army1 = (armySlotPos.length > 2) ? armySlotPos[2] : null; 
    provinceDocument.army1 = (armySlotPos.length > 3) ? armySlotPos[3] : null;
    provinceDocument.save();
}

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
    mergeArmies
};

