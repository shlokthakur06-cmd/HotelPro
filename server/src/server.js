require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'HotelPro API' }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid resource ID' });
  if (err.code === 11000) return res.status(409).json({ message: 'A record with that value already exists' });
  res.status(500).json({ message: 'Server error' });
});

const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`HotelPro API running on port ${port}`)))
  .catch((error) => { console.error('Unable to start server:', error.message); process.exit(1); });
