// src/controllers/cardController.js
const Card = require('../models/Card'); // Import the model!

// READ all cards
exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find();
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cards" });
  }
};

// CREATE a new card
exports.createCard = async (req, res) => {
  try {
    const { name, cardtype, description, image } = req.body; // include image support
    const newCard = await Card.create({ name, cardtype, description, image });
    res.status(201).json({ message: 'Card added successfully!', card: newCard });
  } catch (err) {
    res.status(500).json({ message: 'Error adding card', error: err.message });
  }
};

// UPDATE a card
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedCard = await Card.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedCard) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json({ message: 'Card updated', card: updatedCard });
  } catch (err) {
    res.status(500).json({ message: 'Error updating card', error: err.message });
  }
};

// DELETE a card
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted', product: deleted });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};