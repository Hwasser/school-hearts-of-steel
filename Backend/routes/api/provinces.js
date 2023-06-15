const express = require('express');
const router = express.Router();

const Province = require('../../models/Province');

router.get('/test', (req, res) => res.send('test route for provinces'));

// @route GET api/provinces
// @description Get all provinces
// @access Public
router.get('/', (req, res) => {
    Province.find()
      .then(provinces => res.json(provinces))
      .catch(err => res.status(404).json({ noprovincesfound: 'No provinces found' }));
  });

// @route GET api/Provinces/:id
// @description Get single Province by id
// @access Public
router.get('/:id', (req, res) => {
  Province.findById(req.params.id)
    .then(rovinces => res.json(provinces))
    .catch(err => res.status(404).json({ noprovincesfound: 'No province found' }));
});

// @route GET api/Provinces
// @description add/save Province
// @access Public
router.post('/', (req, res) => {
  Province.create(req.body)
    .then(rovinces => res.json({ msg: 'Province added successfully' }))
    .catch(err => res.status(400).json({ error: 'Unable to add this Province' }));
});

// @route GET api/Provinces/:id
// @description Update Province
// @access Public
router.put('/:id', (req, res) => {
  Province.findByIdAndUpdate(req.params.id, req.body)
    .then(rovinces => res.json({ msg: 'Updated successfully' }))
    .catch(err =>
      res.status(400).json({ error: 'Unable to update the Database' })
    );
});

// @route GET api/Provinces/:id
// @description Delete Province by id
// @access Public
router.delete('/:id', (req, res) => {
  Province.findByIdAndRemove(req.params.id, req.body)
    .then(rovinces => res.json({ mgs: 'Province entry deleted successfully' }))
    .catch(err => res.status(404).json({ error: 'No such a Province' }));
});