const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');

// View basket for a user (GET /basket/:userId)
router.get('/:userId', deckController.getDeck);

// Add to basket (POST /basket/add)
router.post('/add', deckController.addToDeck);

// Remove from basket (DELETE /basket/remove) - reduces quantity or removes
router.delete('/remove', deckController.removeFromDeck);

module.exports = router;
