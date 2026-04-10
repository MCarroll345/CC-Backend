const express = require('express');
const router = express.Router();
const basketController = require('../controllers/deckController');

// View basket for a user (GET /basket/:userId)
router.get('/:userId', basketController.getBasket);

// Add to basket (POST /basket/add)
router.post('/add', basketController.addToBasket);

// Remove from basket (DELETE /basket/remove) - reduces quantity or removes
router.delete('/remove', basketController.removeFromBasket);

module.exports = router;
