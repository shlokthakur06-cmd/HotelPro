const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut, guests } = req.body;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const guestCount = Number(guests);
    if (!roomId || !checkIn || !checkOut || !Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      return res.status(400).json({ message: 'Room, check-in and check-out dates are required' });
    }
    if (start >= end || start < new Date(new Date().setHours(0, 0, 0, 0))) {
      return res.status(400).json({ message: 'Choose a future check-in date and a check-out after check-in' });
    }
    if (!Number.isInteger(guestCount) || guestCount < 1) return res.status(400).json({ message: 'Guest count must be at least 1' });
    const room = await Room.findById(roomId);
    if (!room || !room.isAvailable) return res.status(404).json({ message: 'Room is not available' });
    if (guestCount > room.capacity) return res.status(400).json({ message: `This room allows up to ${room.capacity} guests` });

    const conflict = await Booking.findOne({
      room: roomId,
      status: { $in: ['pending', 'confirmed'] },
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    });
    if (conflict) return res.status(409).json({ message: 'This room is already booked for some of those dates' });

    const nights = Math.ceil((end - start) / 86400000);
    const booking = await Booking.create({
      user: req.user._id, room: roomId, checkIn: start, checkOut: end,
      guests: guestCount, totalPrice: nights * room.pricePerNight
    });
    res.status(201).json(await booking.populate('room'));
  } catch (error) { next(error); }
});

router.get('/my', protect, async (req, res, next) => {
  try {
    res.json(await Booking.find({ user: req.user._id }).populate('room').sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    res.json(await Booking.find().populate('room').populate('user', 'name email').sort({ createdAt: -1 }));
  } catch (error) { next(error); }
});

router.patch('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const allowed = ['pending', 'confirmed', 'cancelled'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid booking status' });
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }).populate('room').populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) { next(error); }
});

module.exports = router;
