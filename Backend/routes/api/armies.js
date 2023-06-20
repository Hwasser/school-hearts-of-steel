const express = require('express');
const router = express.Router();

const Province = require('../../models/Army');

router.get('/test', (req, res) => res.send('test route for provinces'));

// @route GET api/armies/:id
// @description Get single army by id
// @access Public
router.get('/:id', (req, res) => {
    Army.findById(req.params.id)
      .then(army => res.json(army))
      .catch(err => res.status(404).json({ noarmyfound: 'No Army found' }));
  });

// @route GET api/Provinces
// @description add/save Province
// @access Public
router.post('/', (req, res) => {
  Army.create(req.body)
    .then(army => res.json({ armydata: army, msg: 'Army added successfully' }))
    .catch(err => res.status(400).json({ error: 'Unable to add this Army' }));
});

// @route GET api/Provinces/:id
// @description Update Province
// @access Public
router.put('/:id', (req, res) => {
  Army.findByIdAndUpdate(req.params.id, req.body)
    .then(army => res.json({ msg: 'Updated successfully' }))
    .catch(err =>
      res.status(400).json({ error: 'Unable to update the Database' })
    );
});

// @route GET api/Provinces/:id
// @description Delete Province by id
// @access Public
router.delete('/:id', (req, res) => {
  Army.remove({id: req.params.id})
    .then(army => res.json({ mgs: 'Province entry deleted successfully' }))
    .catch(err => res.status(404).json({ error: 'No such a Province' }));
});

module.exports = router;