const express = require('express');
const router = express.Router();
const { 
  broadcastUpdateProvince, 
  broadcastPlayerJoined} = require('../../broadcast');
const {
  mergeArmies
} = require('../../army_related');

const Province = require('../../models/Province');
const Army = require('../../models/Army');


// @route GET api/provinces
// @description Get all provinces
// @access Public
router.get('/', (req, res) => {
  console.log(req.query.purpose);
  // Get one province by its province number
  if (req.query.purpose == "get_by_n") {
    Province.find({id: req.query.id, session: req.query.session})
      .then(provinces => res.json(provinces))
      .catch(err => res.status(404).json({ noprovincesfound: 'No provinces found' }));
  }
  // Get all provinces from a game session
  if (req.query.purpose == "get_all") {
    
    Province.find({session: req.query.session})
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
  // When a player joins a game, broadcast this to all users
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

  // If a player merge his armies, apply this to db and broadcast to other users
  if (req.body.purpose == "merge_armies") {
    try {
      mergeArmies(req.body);
    } catch (err) {
      //res.status(500).json({ error: 'Unable to merge armies' })
      console.log(err);
    }
  }
  
  // Update all army slots in a province
  if (req.body.purpose == "update_province_armies") {
    const armySlots = req.body.armySlots;
    const provinceN = req.body.provinceN;
    const document = await Province.findOne({id: provinceN});
    // Replace army slots
    document.armies = armySlots;
    // Store and broadcast
    document.save();
    broadcastUpdateProvince(document);
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

// @route GET api/Provinces/:id
// @description Delete Province by id
// @access Public
router.delete('/', (req, res) => {
  // Remove all provinces of that perticular session
  if (req.query.purpose != null && req.query.purpose === "remove_session") {
    console.log("Removed provinces for session", req.query.id);
    Province.deleteMany({session: req.query.id})
      .then(province => res.json({ mgs: 'Provinces deleted successfully' }))
      .catch(err => res.status(404).json({ error: 'Failed removing provinces' }));
  // Otherwise remove all provinces
  } else {
    console.log("Removed all provinces!");
    Province.deleteMany({})
      .then(province => res.json({ mgs: 'Provinces deleted successfully' }))
      .catch(err => res.status(404).json({ error: 'Failed removing provinces' }));
  }
});



module.exports = router;