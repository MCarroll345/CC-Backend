const express = require('express');
const router = express.Router();
const genController = require('../controllers/genController');

// Deck recommendations (POST /gen/recommend) - expects { userId, deckName }
router.post('/recommend', genController.deckRecom);

module.exports = router;