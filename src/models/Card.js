// src/models/Product.js
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cardtype: { type: String, required: true },
  description: { type: String },
  image: { type: String } // Store Base64 string here
});

// Important: module.exports
module.exports = mongoose.model('Card', cardSchema);