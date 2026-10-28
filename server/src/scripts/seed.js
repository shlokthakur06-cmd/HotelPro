require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');
const connectDB = require('../config/db');

const rooms = [
  { name: 'Classic Comfort Room', type: 'Standard', description: 'A comfortable room for a relaxing stay.', pricePerNight: 2500, capacity: 2, imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80', amenities: ['Wi-Fi', 'Air conditioning', 'TV'] },
  { name: 'Deluxe City View', type: 'Deluxe', description: 'A bright room with a beautiful city view.', pricePerNight: 4200, capacity: 2, imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', amenities: ['Wi-Fi', 'City view', 'Mini bar', 'TV'] },
  { name: 'Executive Suite', type: 'Suite', description: 'Extra space and premium comforts for your visit.', pricePerNight: 7500, capacity: 3, imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', amenities: ['Wi-Fi', 'Living area', 'Room service', 'Mini bar'] },
  { name: 'Family Retreat', type: 'Family', description: 'A spacious option for families and small groups.', pricePerNight: 5900, capacity: 4, imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', amenities: ['Wi-Fi', 'Two beds', 'Air conditioning', 'TV'] }
];

async function seed() {
  try {
    await connectDB();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@hotelpro.local').toLowerCase();
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: process.env.ADMIN_NAME || 'HotelPro Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin123!',
        role: 'admin'
      });
      console.log(`Created admin account: ${adminEmail}`);
    } else {
      console.log(`Admin already exists: ${adminEmail}`);
    }

    const count = await Room.countDocuments();
    if (count === 0) {
      await Room.insertMany(rooms);
      console.log(`Inserted ${rooms.length} demo rooms`);
    } else {
      console.log(`Rooms already exist (${count}); skipping room seed`);
    }
    console.log('Seed completed');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
seed();
