import axios from 'axios';

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
    replaceArmyInProvince(fromProvince, armiesCopy, null);
    replaceArmyInProvince(toProvince, armiesCopy, null);
}

export async function armyAttack(fromProvince, toProvince, army, fromSlot, armiesCopy) {
    // Manage army slots of source province
    rearrangeSourceSlots(fromProvince, fromSlot, armiesCopy);

    const attackingArmy = await fetchArmy(army);

    for (let i = 3; i >= 0; i--) {
        if (armiesCopy[i][toProvince] != null) {
            const defendingArmy = await fetchArmy(armiesCopy[i][toProvince]);
            const result = performBattle(attackingArmy, defendingArmy);
            if (result == 'win') {;
                console.log("won battle!", attackingArmy['soldiers'], "soldiers left");
                killArmy(defendingArmy['_id']);
                armiesCopy[i][toProvince] = null;
            }
            if (result == 'lose') {
                console.log("lost battle!");
                killArmy(attackingArmy['_id']);
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
    replaceArmyInProvince(fromProvince, armiesCopy);
    if (attackingArmy['soldiers'] > 0) {
        armiesCopy[0][toProvince] = army;
        replaceArmyInProvince(toProvince, armiesCopy, attackingArmy['owner']);
        console.log(army, "won and will be moved to province.", "Soldiers left:", attackingArmy['soldiers']);
        return attackingArmy['owner'];
    } else {
        replaceArmyInProvince(toProvince, armiesCopy, null);
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
    const attackingSoldiers = attackingArmy['soldiers'];
    const defendingSoldiers = defendingArmy['soldiers'];

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
}

function killArmy(armyId) {
    axios
    .delete(`http://localhost:8082/api/armies/${armyId}`)
    .catch((err) => {
    console.log('Error in removing army ' + err);
    });
}

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

// TODO: KNOWN BUG! When moved from province 8 to another province army doubles
function replaceArmyInProvince(provinceId, armies, player) {
    // First we must get the latest properties of the province
    axios.get('http://localhost:8082/api/provinces/', {
    params: { id: provinceId}
    })
    .then( (res) => {
        // Update province with new army data
        const province = res.data[0];
        const id = province['_id'];
        province['army1'] = armies[0][provinceId];
        province['army2'] = armies[1][provinceId];
        province['army3'] = armies[2][provinceId];
        province['army4'] = armies[3][provinceId];
        // Update owner if player conquers province
        if (player != null) {
            province['owner'] = player;
        }
        axios
        .put(`http://localhost:8082/api/provinces/${id}`, province)
        .catch((err) => {
        console.log('Error in replacing armies in province: ' + err);
        });
    })
    .catch( (e) => {
    console.log(e)
    });
}