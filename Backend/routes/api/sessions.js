/**
 * Exempel hur man uppdaterar bara ett värde:
*     const document = await Session.findById(req.params.id);
      document.slot_names[playerSlot] = playerName;
      document.slot_ids[playerSlot] = playerId;
      await document.save();
 */

const express = require('express');
const Session = require('../../models/Session');
const router = express.Router();

const Province = require('../../models/Session');

// @route GET api/armies/
// @description Get all sessions
// @access Public
router.get('/', (req, res) => {
  Session.find()
    .then(session => res.json(session))
    .catch(err => res.status(404).json({ noplayerfound: 'No sessions found' }));
  });

// @route POST api/Session
// @description add/save Session
// @access Public
router.post('/', (req, res) => {
  Session.create(req.body)
    .then(province => res.json({ province: province, msg: 'Session added successfully' }))
    .catch(err => res.status(400).json({ error: 'Unable to add this Session' }));
});

// @route PUT api/Session/:id
// @description Update Session
// @access Public
router.put('/:id', async (req, res) => {
  // If we are adding a player to the session
  if (req.body.purpose == 'add_player') {
    delete req.body.purpose; // This is meta-data for PUT-requests
    Session.findByIdAndUpdate(req.params.id, req.body)
    .then(army => res.json({ msg: 'Updated successfully' }))
    .catch(err =>
      res.status(400).json({ error: 'Unable to update the Database' })
    );

  // If we update resources of the session
  } else {

  }
});

// @route DELETE api/Session/:id
// @description Delete Session by id
// @access Public
router.delete('/:id', (req, res) => {
  Session.remove({id: req.params.id})
    .then(province => res.json({ mgs: 'Session entry deleted successfully' }))
    .catch(err => res.status(404).json({ error: 'No such a Session' }));
});

// @route DELETE api/Session/
// @description Delete all sessions 
// @access Public
router.delete('/', (req, res) => {
  Session.deleteMany({})
    .then(province => res.json({ mgs: 'All sessions removed' }))
    .catch(err => res.status(404).json({ error: 'Couldnt remove all sessions' }));
});

module.exports = router;