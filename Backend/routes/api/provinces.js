const express = require('express');
const router = express.Router();
const { 
  broadcastUpdateProvince, 
  broadcastPlayerJoined, 
  broadcastMoveArmy, 
  broadcastAttackArmy,
  broadcastHasWon } = require('../../broadcast');
const {
  mergeArmies
} = require('../../queryfunctions');

const Province = require('../../models/Province');
const Army = require('../../models/Army');


router.get('/test', (req, res) => res.send('test route for provinces'));

// @route GET api/provinces
// @description Get all provinces
// @access Public
router.get('/', (req, res) => {
  const province_id = req.query.id;
  if (province_id != null) {
    Province.find({id: province_id})
      .then(provinces => res.json(provinces))
      .catch(err => res.status(404).json({ noprovincesfound: 'No provinces found' }));
  } else {
    Province.find()
      .then(provinces => res.json(provinces))
      .catch(err => res.status(404).json({ noprovincesfound: 'No provinces found' }));
  }
});

// @route GET api/Provinces
// @description add/save Province
// @access Public
router.post('/', (req, res) => {
  Province.create(req.body)
    .then(province => res.json({ province: province, msg: 'Province added successfully' }))
    .catch(err => res.status(400).json({ error: 'Unable to add this Province' }));
});

// @route PUT api/Provinces/:id
// @description Update Province
// @access Public
router.put('/:id', (req, res) => {
  Province.findByIdAndUpdate(req.params.id, req.body)
    .then(province => {
      broadcastUpdateProvince(req.body); 
      res.json({ msg: 'Updated successfully' });
    })
    .catch(err =>
      res.status(400).json({ error: 'Unable to update the Database' })
    );
});

// @route PUT api/Provinces
// @description Update all provinces
// @access Public
router.put('/', async (req, res) => {
  // When a player joins a gamez
  if (req.body.purpose == 'replace_empty_slot') {
    try {
      const documents = await Province.find({owner: req.body.oldName});
      const document = documents[0]; // Players only start with one province
      document.owner = req.body.newName;
      broadcastPlayerJoined(document, req.body.sessionId);
      await document.save();
      res.status(200).send('Session updated');
    } catch {
      res.status(500).json({ error: 'Unable to update empty slot in province' })
    }
  }
  if (req.body.purpose == 'move_army' || req.body.purpose == 'attack_army' ) {
    try {
      await attackOrMoveArmy(req.body.package, req.body.purpose);
      res.status(200).send('Session updated');
    } catch (err) {
      res.status(500).json({ error: 'Unable to move army between provinces' })
    }
  }
  if (req.body.purpose == "merge_armies") {
    try {
      mergeArmies(req.body);
    } catch (err) {
      //res.status(500).json({ error: 'Unable to merge armies' })
      console.log(err);
    }
  }
});

// @route GET api/Provinces/:id
// @description Delete Province by id
// @access Public
router.delete('/:id', (req, res) => {
  Province.remove({id: req.params.id})
    .then(province => res.json({ mgs: 'Province entry deleted successfully' }))
    .catch(err => res.status(404).json({ error: 'No such a Province' }));
});

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
  // Fetch provinces
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
    toDocument.owner = package.winner;
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



module.exports = router;