const express = require('express');
const router = express.Router();
const Deck = require('../models/Deck');
const Card = require('../models/Card');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

router.post('/recomalter', async (req, res) => {
  try {
    const { userId, deckName, userPrompt } = req.body;
    if (!userId || !deckName || !userPrompt) return res.status(400).json({ message: 'userId, deckName and userPrompt required' });

    const deck = await Deck.findOne({ userId, deckName }).populate('cards.card');
    if (!deck) return res.status(404).json({ message: 'Deck not found' });

    const cardList = deck.cards.map(({ card, quantity }) =>
      `${quantity}x ${card.name} (${card.type}) - ${card.oracleText}`
    ).join('\n');

    const prompt = `You are a Magic: The Gathering deck building assistant. The user has a ${deck.format} deck called "${deckName}" with the following cards:

${cardList}

User request: ${userPrompt}

Respond ONLY with a valid JSON object in this exact format, no markdown, no explanation:
{
  "changes": [
    { "action": "add", "cardName": "<exact card name>", "quantity": <number> },
    { "action": "remove", "cardName": "<exact card name>", "quantity": <number> }
  ],
  "summary": "<brief explanation of changes>"
}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);

    let parsed;
    try {
      const text = result.response.text().replace(/```json|```/g, '').trim();
      parsed = JSON.parse(text);
    } catch {
      return res.status(500).json({ message: 'AI returned invalid JSON', raw: result.response.text() });
    }

    const applied = [];
    const skipped = [];

    for (const change of parsed.changes) {
      if (change.action === 'add') {
        let card = await Card.findOne({ name: change.cardName });
        if (!card) {
          const scryfallRes = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(change.cardName)}`);
          if (!scryfallRes.ok) { skipped.push({ cardName: change.cardName, reason: 'Not found on Scryfall' }); continue; }
          const data = await scryfallRes.json();
          card = await Card.create({
            name: data.name,
            manaCost: data.mana_cost,
            type: data.type_line,
            price: data.prices?.eur ? parseFloat(data.prices.eur) : null,
            oracleText: data.oracle_text,
            imageUrl: data.image_uris?.normal || null
          });
        }

        const existing = deck.cards.find(c => c.card._id.toString() === card._id.toString());
        if (deck.format === 'Commander' && existing) { skipped.push({ cardName: change.cardName, reason: 'Commander: only one copy allowed' }); continue; }
        if (deck.format === 'Commander' && deck.cards.length >= 100) { skipped.push({ cardName: change.cardName, reason: 'Commander: deck is full' }); continue; }
        if (deck.format === 'Standard' && existing && existing.quantity + change.quantity > 4) { skipped.push({ cardName: change.cardName, reason: 'Standard: would exceed 4 copies' }); continue; }

        if (existing) existing.quantity += change.quantity;
        else deck.cards.push({ card: card._id, quantity: change.quantity });
        applied.push({ action: 'add', cardName: change.cardName, quantity: change.quantity });

      } else if (change.action === 'remove') {
        const card = await Card.findOne({ name: change.cardName });
        if (!card) { skipped.push({ cardName: change.cardName, reason: 'Card not in database' }); continue; }

        const idx = deck.cards.findIndex(c => c.card._id.toString() === card._id.toString());
        if (idx === -1) { skipped.push({ cardName: change.cardName, reason: 'Card not in deck' }); continue; }

        deck.cards[idx].quantity -= change.quantity;
        if (deck.cards[idx].quantity <= 0) deck.cards.splice(idx, 1);
        applied.push({ action: 'remove', cardName: change.cardName, quantity: change.quantity });
      }
    }

    await deck.save();
    await deck.populate('cards.card');
    res.json({ summary: parsed.summary, applied, skipped, deck });
  } catch (err) {
    res.status(500).json({ message: 'Error applying recommendations', error: err.message });
  }
});


exports.routes = router;
