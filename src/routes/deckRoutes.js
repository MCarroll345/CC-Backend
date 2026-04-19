const express = require('express');
const router = express.Router();
const Deck = require('../models/Deck');
const Card = require('../models/Card');
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.get('/:userId', (req, res) => {
  Deck.find({ userId: req.params.userId }).populate('cards.card')
    .then(decks => res.json(decks))
    .catch(err => res.status(500).json({ message: 'Error fetching deck', error: err.message }));
});

router.post('/', (req, res) => {
  const { userId, deckName, format } = req.body;
  if (!userId) return res.status(400).json({ message: 'userId is required' });
  Deck.create({ userId, deckName, format })
    .then(deck => res.status(201).json({ message: 'Deck created successfully!', deck }))
    .catch(err => res.status(500).json({ message: 'Error creating deck', error: err.message }));
});

router.post('/add', async (req, res) => {
  try {
    const { userId, cardName, deckName } = req.body;
    const quantity = parseInt(req.body.quantity) || 1;
    if (!userId || !cardName) return res.status(400).json({ message: 'userId and cardName required' });

    const card = await Card.findOne({ name: cardName });
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const deck = await Deck.findOne({ userId, deckName });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    const existing = deck.cards.find(c => c.card.toString() === card._id.toString());

    if (deck.format === 'Commander' && !existing && deck.cards.length >= 100)
      return res.status(400).json({ message: 'Commander decks can only have 100 cards' });
    if (existing && deck.format === 'Commander')
      return res.status(400).json({ message: 'Commander decks can only have one copy of each card' });

    if (existing) {
      if (deck.format === 'Standard' && existing.quantity + quantity > 4)
        return res.status(400).json({ message: 'Standard decks can only have 4 copies of each card' });
      existing.quantity += quantity;
    } else {
      deck.cards.push({ card: card._id, quantity });
    }

    await deck.save();
    await deck.populate('cards.card');
    res.json({ message: 'Deck updated', deck });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to deck', error: err.message });
  }
});

router.delete('/remove', async (req, res) => {
  try {
    const { userId, cardId, deckName } = req.body;
    const quantity = parseInt(req.body.quantity) || 1;
    const removeAll = req.body.removeAll === true || req.body.removeAll === 'true';
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const deck = await Deck.findOne({ userId, deckName });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    if (removeAll) {
      deck.cards = [];
    } else {
      const idx = deck.cards.findIndex(c => c.card.toString() === cardId);
      if (idx === -1) return res.status(404).json({ message: 'Card not in deck' });
      deck.cards[idx].quantity -= quantity;
      if (deck.cards[idx].quantity <= 0) deck.cards.splice(idx, 1);
    }

    await deck.save();
    await deck.populate('cards.card');
    res.json({ message: 'Deck updated', deck });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from deck', error: err.message });
  }
});

router.put('/update', (req, res) => {
  const { userId, deckName, newDeckName, newFormat } = req.body;
  if (!userId || !deckName || !newDeckName)
    return res.status(400).json({ message: 'userId, deckName and newDeckName required' });
  Deck.findOneAndUpdate({ userId, deckName }, { deckName: newDeckName, format: newFormat }, { new: true })
    .then(deck => {
      if (!deck) return res.status(404).json({ message: 'Deck not found' });
      res.json({ message: 'Deck updated', deck });
    })
    .catch(err => res.status(500).json({ message: 'Error updating deck', error: err.message }));
});

router.post('/price', (req, res) => {
  const { userId, deckName } = req.body;
  if (!userId || !deckName) return res.status(400).json({ message: 'userId and deckName required' });
  Deck.findOne({ userId, deckName }).populate('cards.card')
    .then(deck => {
      if (!deck) return res.status(404).json({ message: 'Deck not found' });
      const totalPrice = deck.cards.reduce((sum, item) => sum + ((item.card.price || 0) * item.quantity), 0);
      res.json({ deckName: deck.deckName, totalPrice });
    })
    .catch(err => res.status(500).json({ message: 'Error getting deck price', error: err.message }));
});

router.delete('/delete', (req, res) => {
  const { userId, deckName } = req.body;
  if (!userId || !deckName) return res.status(400).json({ message: 'userId and deckName required' });
  Deck.findOneAndDelete({ userId, deckName })
    .then(deck => {
      if (!deck) return res.status(404).json({ message: 'Deck not found' });
      res.json({ message: 'Deck deleted', deck });
    })
    .catch(err => res.status(500).json({ message: 'Error deleting deck', error: err.message }));
});

router.post('/recommend', async (req, res) => {
  try {
    const { userId, deckName } = req.body;
    if (!userId || !deckName) return res.status(400).json({ message: 'userId and deckName required' });

    const deck = await Deck.findOne({ userId, deckName }).populate('cards.card');
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    const cardList = deck.cards.map(({ card, quantity }) =>
      `${quantity}x ${card.name} (${card.type}) - ${card.oracleText}`
    ).join('\n');

    const prompt = `You are a Magic: The Gathering expert. Review this ${deck.format} deck and provide concise improvement recommendations.\n\nDeck: ${deckName}\nFormat: ${deck.format}\n\nCards:\n${cardList}\n\nProvide specific suggestions to improve synergy, consistency, and power level.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);

    res.json({ recommendations: result.response.text() });
  } catch (err) {
    res.status(500).json({ message: 'Error getting recommendations', error: err.message });
  }
});

exports.routes = router;
