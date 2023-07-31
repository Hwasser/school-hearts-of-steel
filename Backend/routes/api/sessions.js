const express = require('express');
const router = express.Router();
const Session = require('../../models/Session');
const Province = require('../../models/Province');
const { gameSessionStart, gameSessionStop } = require('../../gamesessions');

// @route GET api/Session/
// @description Get all sessions
// @access Public
router.get('/', (req, res) => {
  Session.find()
    .then(session => res.json(session))
    .catch(err => res.status(404).json({ noplayerfound: 'No sessions found' }));
  });

// @route GET api/Session/:id
// @description Get single Session by id
// @access Public
router.get('/:id', (req, res) => {
  Session.findById(req.params.id)
    .then(session => res.json(session))
    .catch(err => res.status(404).json({ noarmyfound: 'No Army found' }));
});

// @route POST api/Session
// @description add/save Session
// @access Public
router.post('/', (req, res) => {
  Session.create(req.body)
    .then(session => {
      gameSessionStart(session._id); // Start a game loop
      res.json({ session: session, msg: 'Session added successfully' });
    })
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
  }
  // If a player buys something, update resources
  if (req.body.purpose == 'buy_stuff') {
    try {
      const slotIndex = req.body.slotIndex;
      const document = await Session.findById(req.params.id);
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

// @route DELETE api/sessions/:id
// @description Delete Session by id
// @access Public
router.delete('/:id', async (req, res) => {
  await gameSessionStop(req.params.id); // Close the current game session
  Session.findOneAndDelete({_id: req.params.id})
    .then(session => res.json({ mgs: 'Session ' + req.params.id + ' successfully removed!' }))
    .catch(err => res.status(404).json({ error: 'No such session' }));
});

// @route DELETE api/Session/
// @description Delete all sessions 
// @access Public
router.delete('/', (req, res) => {
  Session.deleteMany({})
    .then(session => {
      gameSessionStop(); // Close all current game sessions;
      res.json({ mgs: 'All sessions removed' });
    })
    .catch(err => res.status(404).json({ error: 'Couldnt remove all sessions' }));
});

module.exports = router;