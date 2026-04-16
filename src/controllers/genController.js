const Deck = require('../models/Deck');
const Card = require('../models/Card');
const e = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.deckRecom = async (req, res) => {
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);

    res.json({ recommendations: result.response.text() });
  } catch (err) {
    res.status(500).json({ message: 'Error getting recommendations', error: err.message });
  }
};