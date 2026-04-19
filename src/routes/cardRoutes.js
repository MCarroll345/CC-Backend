const express = require('express');
const router = express.Router();
const Card = require('../models/Card');

router.get('/', (req, res) => {
  Card.find()
    .then(cards => res.json(cards))
    .catch(err => res.status(500).json({ message: 'Error fetching cards', error: err.message }));
});

router.post('/:cardname', (req, res) => {
  const { cardname } = req.params;
  fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardname)}`)
    .then(response => {
      if (!response.ok) throw new Error(`Response status: ${response.status}`);
      return response.json();
    })
    .then(data => Card.create({
      name: data.name,
      manaCost: data.mana_cost,
      type: data.type_line,
      price: data.prices.eur ? parseFloat(data.prices.eur) : null,
      oracleText: data.oracle_text,
      imageUrl: data.image_uris?.normal || null
    }))
    .then(newCard => res.status(201).json({ message: 'Card added successfully!', card: newCard }))
    .catch(err => res.status(500).json({ message: 'Error adding card', error: err.message }));
});

router.delete('/:id', (req, res) => {
  Card.findByIdAndDelete(req.params.id)
    .then(deleted => {
      if (!deleted) return res.status(404).json({ message: 'Card not found' });
      res.json({ message: 'Card deleted', card: deleted });
    })
    .catch(err => res.status(500).json({ message: 'Error deleting card', error: err.message }));
});

exports.routes = router;
