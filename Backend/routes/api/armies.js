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

// @route GET api/armies/
// @description add/save Province
// @access Public
router.post('/', (req, res) => {
  Army.create(req.body)
    .then(army => res.json({ armydata: army, msg: 'Army added successfully' }))
    .catch(err => res.status(400).json({ error: 'Unable to add this Army' }));
});

// @route GET api/armies/:id
// @description Update Army
// @access Public
router.put('/:id', (req, res) => {
  Army.findByIdAndUpdate(req.params.id, req.body)
    .then(army => res.json({ msg: 'Updated successfully' }))
    .catch(err =>
      res.status(400).json({ error: 'Unable to update the Database' })
    );
});

// @route DELETE api/armies/:id
// @description Delete Army by id
// @access Public
router.delete('/:id', (req, res) => {
  Army.findOneAndDelete({_id: req.params.id})
    .then(army => res.json({ mgs: 'Army ' + req.params.id + ' successfully removed!' }))
    .catch(err => res.status(404).json({ error: 'No such army' }));
});

// @route api/armies/
// @description Delete all armies
// @access Public
router.delete('/', (req, res) => {
  Army.deleteMany({})
    .then(army => res.json({ mgs: 'Province entry deleted successfully' }))
    .catch(err => res.status(404).json({ error: 'Could not remove all armies' }));
});

module.exports = router;