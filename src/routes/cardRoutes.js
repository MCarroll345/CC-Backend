// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
// Import the controller functions
const cardController = require('../controllers/cardController');

// Notice we just use '/' here, because we will mount this router on '/products' later
router.get('/', cardController.getCards);
//Send the name of the card to add as a param in the URL, e.g. POST /cards/Lightning%20Bolt
router.post('/:cardname', cardController.createCard);
//Send the id of the card to update as a param in the URL, e.g. PUT /cards/12345
router.delete('/:id', cardController.deleteCard);

module.exports = router;