const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deckItemSchema = new Schema({
  card: { type: Schema.Types.ObjectId, ref: 'Card', required: true },
  quantity: { type: Number, default: 1, min: 1 }
});

const deckSchema = new Schema({
  userId: { type: String, required: true, index: true },
  deckName: { type: String, default: 'My Deck' },
  cards: [deckItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Deck', deckSchema);
