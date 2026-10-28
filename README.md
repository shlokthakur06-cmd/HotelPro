# HotelPro — Hotel Management System

A full-stack MERN starter for hotel operations: guest registration/login, room browsing, reservation management, and admin room management.

## Stack
- Client: React + Vite + Bootstrap
- Server: Node.js + Express
- Database: MongoDB + Mongoose
- Authentication: JWT + bcryptjs

## Requirements
- Node.js 16+ (Node 18+ recommended)
- npm 8+
- MongoDB local instance or MongoDB Atlas connection string

## Project structure
```text
HotelPro/
  client/
  server/
    src/
      config/
      middleware/
      models/
      routes/
      scripts/
    .env.example
```

## 1. Configure the server
Open a terminal in `server/` and run:
```bash
npm install
```
Copy `.env.example` to `.env` and edit values:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hotelpro
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
ADMIN_NAME=HotelPro Admin
ADMIN_EMAIL=admin@hotelpro.local
ADMIN_PASSWORD=Admin123!
```

Make sure MongoDB is running, then seed demo data:
```bash
npm run seed
```
This creates sample rooms and an admin account. Demo admin credentials are:
- Email: `admin@hotelpro.local`
- Password: `Admin123!`

**Change the demo password and JWT secret before using this outside local development.**

Start the API:
```bash
npm run dev
```
API base URL: `http://localhost:5000/api`

## 2. Start the client
In a second terminal:
```bash
cd client
npm install
```
Create `client/.env` (optional; defaults to the local API):
```env
VITE_API_URL=http://localhost:5000/api
```
Run:
```bash
npm run dev
```
Open the URL printed by Vite (usually `http://localhost:5173`).

## Main API endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/rooms`
- `GET /api/rooms/:id`
- `POST /api/rooms` (admin)
- `PUT /api/rooms/:id` (admin)
- `DELETE /api/rooms/:id` (admin)
- `POST /api/bookings` (authenticated guest)
- `GET /api/bookings/my` (authenticated guest)
- `GET /api/bookings` (admin)
- `PATCH /api/bookings/:id/status` (admin)

## Notes
- Booking creation validates dates and checks overlapping confirmed/pending bookings for the room.
- Payments are represented as a status field only. This starter does **not** charge real cards or integrate a payment gateway.
- This is a development starter, not a production-hardened system. Before production, add rate limiting, email verification/password reset, audit logs, stricter validation, secure deployment configuration, and a real payment provider.
