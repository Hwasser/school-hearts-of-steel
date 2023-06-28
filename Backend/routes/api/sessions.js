const express = require('express');
const router = express.Router();

const Province = require('../../models/Session');

// @route GET api/armies/
// @description Get all sessions
// @access Public
router.get('/', (req, res) => {
  Session.findMany()
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
router.put('/:id', (req, res) => {
  Session.findByIdAndUpdate(req.params.id, req.body)
    .then(province => res.json({ msg: 'Updated successfully' }))
    .catch(err =>
      res.status(400).json({ error: 'Unable to update the Database' })
    );
});

// @route DELETE api/Session/:id
// @description Delete Session by id
// @access Public
router.delete('/:id', (req, res) => {
  Session.remove({id: req.params.id})
    .then(province => res.json({ mgs: 'Session entry deleted successfully' }))
    .catch(err => res.status(404).json({ error: 'No such a Session' }));
});

module.exports = router;