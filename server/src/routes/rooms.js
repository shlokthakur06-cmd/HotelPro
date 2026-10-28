const express = require('express');
const Room = require('../models/Room');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.maxPrice) filter.pricePerNight = { $lte: Number(req.query.maxPrice) };
    if (req.query.availableOnly === 'true') filter.isAvailable = true;
    res.json(await Room.find(filter).sort({ pricePerNight: 1 }));
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) { next(error); }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) { next(error); }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) { next(error); }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
