const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Standard', 'Deluxe', 'Suite', 'Family'], default: 'Standard' },
  description: { type: String, default: '' },
  pricePerNight: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1, default: 2 },
  imageUrl: { type: String, default: '' },
  amenities: [{ type: String }],
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
