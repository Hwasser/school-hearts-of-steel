const express = require('express');
const router = express.Router();

const Province = require('../../models/Player');

router.get('/test', (req, res) => res.send('test route for players'));

// @route GET api/armies/:id
// @description Get single army by id
// @access Public
router.get('/:id', (req, res) => {
    Player.findById(req.params.id)
      .then(player => res.json(player))
      .catch(err => res.status(404).json({ noplayerfound: 'No Player found' }));
  });

// @route GET api/armies/
// @description add/save Province
// @access Public
router.post('/', (req, res) => {
  Player.create(req.body)
    .then(player => res.json({ playerdata: player, msg: 'Player added successfully' }))
    .catch(err => res.status(400).json({ error: 'Unable to add this Player' }));
});

// @route GET api/armies/:id
// @description Update Army
// @access Public
router.put('/:id', (req, res) => {
  Player.findByIdAndUpdate(req.params.id, req.body)
    .then(player => res.json({ msg: 'Updated successfully' }))
    .catch(err =>
      res.status(400).json({ error: 'Unable to update the Database' })
    );
});

// @route DELETE api/armies/:id
// @description Delete Army by id
// @access Public
router.delete('/:id', (req, res) => {
  Player.findOneAndDelete({_id: req.params.id})
    .then(player => res.json({ mgs: 'Player ' + req.params.id + ' successfully removed!' }))
    .catch(err => res.status(404).json({ error: 'No such player' }));
});

// @route api/armies/
// @description Delete all armies
// @access Public
router.delete('/', (req, res) => {
  Player.deleteMany({})
    .then(player => res.json({ mgs: 'Player entry deleted successfully' }))
    .catch(err => res.status(404).json({ error: 'Could not remove all players' }));
});

module.exports = router;