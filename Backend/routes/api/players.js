const express = require('express');
const router = express.Router();

const {connectPlayer} = require('../../broadcast');
const Player = require('../../models/Player');

// @route GET api/armies/:id
// @description Get single army by id
// @access Public
router.get('/', (req, res) => {
  Player.findOne( {name: req.query.name, password: req.query.password} )
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


// @route GET api/players/
// @description used when player connects
// @access Public
router.put('/', (req, res) => {
  const dataPackage = req.body.params;
  connectPlayer(dataPackage.token, dataPackage.sessionId, dataPackage.player)
});

module.exports = router;