const Deck = require('../models/Deck');
const Card = require('../models/Card');

exports.createDeck = async (req, res) => {
  try {
    const { userId, deckName } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const newDeck = await Deck.create({ userId, deckName });
    res.status(201).json({ message: 'Deck created successfully!', deck: newDeck });
  } catch (err) {
    res.status(500).json({ message: 'Error creating deck', error: err.message });
  }
}

// View deck for a user
exports.getDecks = async (req, res) => {
  try {
    const { userId } = req.params;
    const allDecks = await Deck.find({ userId }).populate('cards');
    res.json(allDecks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching deck', error: err.message });
  }
};

// Add card to deck (or increase quantity)
exports.addToDeck = async (req, res) => {
  try {
    const { userId, cardName, deckName, quantity = 1 } = req.body;
    if (!userId || !cardName) return res.status(400).json({ message: 'userId and cardName required' });

    const card = await Card.findOne({ name: cardName });
    if (!card) return res.status(404).json({ message: 'Card not found' });

    let deck = await Deck.findOne({ userId, deckName });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    const existing = deck.cards.find(c => c.card.toString() === card._id.toString());
    if (existing) {
      existing.quantity = Math.max(1, existing.quantity + quantity);
    } else {
      deck.cards.push({ card: card._id, quantity });
    }

    await deck.save();
    await deck.populate('cards.card');
    res.json({ message: 'Deck updated', deck });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to deck', error: err.message });
  }
};

// Remove card or reduce quantity
exports.removeFromDeck = async (req, res) => {
  try {
    const { userId, cardId, removeAll = false } = req.body;
    if (!userId || !cardId) return res.status(400).json({ message: 'userId and cardId required' });

    const deck = await Deck.findOne({ userId });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    const idx = deck.cards.findIndex(c => c.card.toString() === cardId);
    if (idx === -1) return res.status(404).json({ message: 'Card not in deck' });

    if (removeAll) {
      deck.cards.splice(idx, 1);
    } else {
      deck.cards[idx].quantity = Math.max(0, deck.cards[idx].quantity - 1);
      if (deck.cards[idx].quantity === 0) deck.cards.splice(idx, 1);
    }

    await deck.save();
    await deck.populate('cards.card');
    res.json({ message: 'Deck updated', deck });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from deck', error: err.message });
  }
};

// Remove a deck item by its subdocument id (itemId)
exports.removeItem = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!userId || !itemId) return res.status(400).json({ message: 'userId and itemId required' });

    const deck = await Deck.findOne({ userId });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    const idx = deck.cards.findIndex(c => c._id.toString() === itemId);
    if (idx === -1) return res.status(404).json({ message: 'Card not found in deck' });

    deck.cards.splice(idx, 1);
    await deck.save();
    await deck.populate('cards.card');
    res.json({ message: 'Card removed', deck });
  } catch (err) {
    res.status(500).json({ message: 'Error removing item', error: err.message });
  }
};

// Clear all items for a user's deck
exports.clearDeck = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const deck = await Deck.findOneAndUpdate({ userId }, { cards: [] }, { new: true });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    await deck.populate('cards.card');
    res.json({ message: 'Deck cleared', deck });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing deck', error: err.message });
  }
};
