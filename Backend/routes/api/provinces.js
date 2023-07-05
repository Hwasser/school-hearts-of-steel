const express = require('express');
const router = express.Router();
const { updateProvince, playerJoined, moveArmy, attackArmy } = require('../../broadcast');

const Province = require('../../models/Province');
const Session = require('../../models/Session');

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
      updateProvince(req.body); 
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
      delete req.body.purpose; // We don't need the meta-data anymore
      const documents = await Province.find({owner: req.body.oldName});
      const document = documents[0]; // Players only start with one province
      document.owner = req.body.newName;
      playerJoined(document);
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
});

async function attackOrMoveArmy(package, purpose) {
  console.log(purpose); // TODO: REMOVE
  const fromProvince = package.from;
  const toProvince = package.to;
  const armies     = package.armies;
  // Fetch provinces
  const fromDocuments = await Province.find({id: fromProvince});
  const toDocuments   = await Province.find({id: toProvince});
  const fromDocument = fromDocuments[0];
  const toDocument   = toDocuments[0];
  // Update provinces
  fromDocument.army1 = armies[0][fromProvince];
  fromDocument.army2 = armies[1][fromProvince];
  fromDocument.army3 = armies[2][fromProvince];
  fromDocument.army4 = armies[3][fromProvince];
  toDocument.army1 = armies[0][toProvince];
  toDocument.army2 = armies[1][toProvince];
  toDocument.army3 = armies[2][toProvince];
  toDocument.army4 = armies[3][toProvince];
  if (purpose == 'move_army') {
    moveArmy(fromDocument, toDocument);
  } else {
    console.log("33333333"); // TODO: REMOVE
    toDocument.owner = package.winner;
    attackArmy(fromDocument, toDocument);
  }
  await fromDocument.save();
  await toDocument.save();
}

// @route GET api/Provinces/:id
// @description Delete Province by id
// @access Public
router.delete('/:id', (req, res) => {
  Province.remove({id: req.params.id})
    .then(province => res.json({ mgs: 'Province entry deleted successfully' }))
    .catch(err => res.status(404).json({ error: 'No such a Province' }));
});

module.exports = router;