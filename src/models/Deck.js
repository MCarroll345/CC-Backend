const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deckItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1, min: 1 }
});

const deckSchema = new Schema({
  userId: { type: String, required: true, index: true },
  items: [deckItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Deck', deckSchema);
