// src/server.js
require('dotenv').config(); // Load env vars first!
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db'); // Import DB logic

// Import Routes
const cardRoutes = require('./routes/cardRoutes');
const indexRoutes = require('./routes/indexRoutes');
const deckRoutes = require('./routes/deckRoutes');
const authRoutes = require('./routes/authRoutes');
const protect = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect to Database
connectDB();

// Use Routes
app.use('/', indexRoutes); // Handles /api/status
app.use('/auth', authRoutes);
// Mount card routes at the '/cards' base path (JWT protected)
app.use('/cards', cardRoutes);
// Mount deck routes (JWT protected)
app.use('/deck', deckRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port: ${PORT}`);
});