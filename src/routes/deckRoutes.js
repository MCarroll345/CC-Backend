const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');

// View decks for a user (GET /decks/:userId)
router.get('/:userId', deckController.getDecks);
// Create a new deck (POST /decks)
router.post('/', deckController.createDeck);
// Add to deck (POST /decks/add)
router.post('/add', deckController.addToDeck);
// Remove from deck (DELETE /decks/remove) - reduces quantity or removes
router.delete('/remove', deckController.removeFromDeck);
// Get deck price (POST /decks/price) - expects { userId, deckName }
router.post('/price', deckController.getDeckPrice);

module.exports = router;
