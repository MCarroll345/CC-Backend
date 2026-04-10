// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
// Import the controller functions
const cardController = require('../controllers/cardController');

// Notice we just use '/' here, because we will mount this router on '/products' later
router.get('/', cardController.getCards);
router.get('/api', cardController.api);
router.post('/', cardController.createCard);
router.put('/:id', cardController.updateCard);
router.delete('/:id', cardController.deleteCard);

module.exports = router;