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
  console.log("Something happened:", req.body);
  // If we are adding a player to the session
  if (req.body.purpose == 'add_player') {
    delete req.body.purpose; // This is meta-data for PUT-requests
    Session.findByIdAndUpdate(req.params.id, req.body)
    .then(army => res.json({ msg: 'Updated successfully' }))
    .catch(err =>
      res.status(400).json({ error: 'Unable to update the Database' })
    );
  }
  // If a player buys something, update resources
  if (req.body.purpose == 'buy_stuff') {
    try {
      const slotIndex = req.body.slotIndex;
      const document = await Session.findById(req.params.id)
      // Change value
      document.food[slotIndex]     -= req.body.food;
      document.fuel[slotIndex]     -= req.body.fuel;
      document.tools[slotIndex]    -= req.body.tools;
      document.material[slotIndex] -= req.body.material;
      // Store value and show status
      await document.save();
      res.status(200).send('Session updated');
    } catch {
      res.status(500).json({ error: 'Unable to update empty slot in province' })
    }
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