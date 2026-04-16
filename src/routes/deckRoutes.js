const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');

// View decks for a user (GET /decks/:userId)
router.get('/:userId', deckController.getDecks);
// Create a new deck (POST /decks) - expects { userId, deckName, format(Commander, Standard) }
router.post('/', deckController.createDeck);
// Add to deck (POST /decks/add) - expects { userId, cardName, deckName, quantity }
router.post('/add', deckController.addToDeck);
// Remove from deck (DELETE /decks/remove) - expects { userId, cardId, deckName, quantity, removeAll(boolean) }
router.delete('/remove', deckController.removeFromDeck);
// Update deck (PUT /decks/update) - expects { userId, deckName, newDeckName, newFormat }
router.put('/update', deckController.updateDeck);
// Get deck price (POST /decks/price) - expects { userId, deckName }
router.post('/price', deckController.getDeckPrice);
// Delete deck (DELETE /decks/delete) - expects { userId, deckName }
router.delete('/delete', deckController.deleteDecks);
// Deck recommendations (POST /decks/recommend) - expects { userId, deckName }
router.post('/recommend', deckController.deckRecom);

module.exports = router;
