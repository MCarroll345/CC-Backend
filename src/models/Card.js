// src/models/Product.js
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  manaCost: { type: String },
  type: { type: String, required: true },
  oracleText: { type: String },
  imageUrl: { type: String }
});

// Important: module.exports
module.exports = mongoose.model('Card', cardSchema);