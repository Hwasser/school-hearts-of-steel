const express = require('express');
const router = express.Router();

const Upgrade = require('../../models/Upgrade');

// @route GET api/upgrades/
// @description add/save Upgrade
// @access Public
router.post('/', (req, res) => {
  Upgrade.create(req.body)
    .then(upgrades => res.json({ upgrades: upgrades, msg: 'Upgrade added successfully' }))
    .catch(err => res.status(400).json({ error: 'Unable to add this Upgrade' }));
});

// @route GET api/upgrades/:id
// @description Update Upgrade
// @access Public
router.put('/:id', (req, res) => {
  Upgrade.findByIdAndUpdate(req.params.id, req.body)
    .then(upgrade => res.json({ msg: 'Updated successfully' }))
    .catch(err =>
      res.status(400).json({ error: 'Unable to update the Database' })
    );
});

// @route GET api/Upgrade/:id
// @description Get single Upgrade by id
// @access Public
router.get('/:id', (req, res) => {
  Upgrade.findById(req.params.id)
    .then(upgrade => res.json(upgrade))
    .catch(err => res.status(404).json({ noupgradefound: 'No Upgrade found' }));
});

// @route DELETE api/Upgrade/:id
// @description Delete Upgrade by id
// @access Public
router.delete('/:id', (req, res) => {
  Upgrade.findOneAndDelete({_id: req.params.id})
    .then(upgrade => res.json({ mgs: 'Upgrade entry deleted successfully' }))
    .catch(err => res.status(404).json({ error: 'No such a Upgrade' }));
});

// @route DELETE api/Upgrade/
// @description Delete all upgrades 
// @access Public
router.delete('/', (req, res) => {
  Upgrade.deleteMany({})
    .then(upgrade => {
      res.json({ mgs: 'All upgrades removed' });
    })
    .catch(err => res.status(404).json({ error: 'Couldnt remove all upgrades' }));
});

module.exports = router;