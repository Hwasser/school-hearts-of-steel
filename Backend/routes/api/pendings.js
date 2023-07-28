const express = require('express');
const router = express.Router();

const Pending = require('../../models/Pending');

// @route GET api/pendings/:id
// @description Get all Pending events by a session id
// @access Public
router.get('/:id', (req, res) => {
    Pending.find({session: req.params.id})
      .then(sessions => res.json(sessions))
      .catch(err => res.status(404).json({ noarmyfound: 'No pending actions found' }));
  });

// @route GET api/pendings/
// @description add Pending action
// @access Public
router.post('/', (req, res) => {
  Pending.create(req.body)
    .then(pending => res.json({msg: 'Player added successfully' }))
    .catch(err => res.status(400).json({ error: 'Unable to add this Player' }));
});

// @route DELETE api/pendings/:id
// @description Delete pending action by token
// @access Public
router.delete('/:id', (req, res) => {
    Pending.findOneAndDelete({_id: req.params.id})
      .then(army => res.json({ mgs: 'Army ' + req.params.id + ' successfully removed!' }))
      .catch(err => res.status(404).json({ error: 'No such army' }));
  });
  

module.exports = router;