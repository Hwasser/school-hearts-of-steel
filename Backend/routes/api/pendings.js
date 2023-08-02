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

// @route GET api/pendings/:id
// @description Get all Pending events by other means
// @access Public
router.get('/', (req, res) => {
  Pending.find({session: req.query.session, player: req.query.player})
    .then(sessions => res.json(sessions))
    .catch(err => res.status(404).json({ noarmyfound: 'No pending actions found' }));
});

// @route GET api/pendings/
// @description add Pending action
// @access Public
router.post('/', async (req, res) => {
  
  // For movements, remove current pending movement of unit if we change direction
  // Don't allow changing the movement on the same time as the execution
  if (req.body.type == 'movement') {
    const result = await Pending.deleteOne(
      {session: req.body.session, type: 'movement', army_id: req.body.army_id, end: { $ne: req.body.start }})
      Pending.create(req.body)
      .then(pending => res.json(pending))
      .catch(err => res.status(400).json({ error: 'Unable to add pending event' }));
    } else {
      // Other stuff is taken care on the client side
      Pending.create(req.body)
        .then(pending => res.json(pending))
        .catch(err => res.status(400).json({ error: 'Unable to add pending event' }));
    }

});

// @route DELETE api/pendings/:id
// @description Delete pending action by token
// @access Public
router.delete('/:id', (req, res) => {
    Pending.findOneAndDelete({_id: req.params.id})
      .then(army => res.json({ mgs: 'Army ' + req.params.id + ' successfully removed!' }))
      .catch(err => res.status(404).json({ error: 'No such pending event' }));
  });
  

module.exports = router;