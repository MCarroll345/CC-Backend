// src/config/db.js

const mongoose = require('mongoose');
const Card = require('../models/Card'); // Needed for seeding
const Deck = require('../models/Deck'); // Import the model

const connectDB = async () => {

  try {

    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined in environment');
    await mongoose.connect(uri, { /* options */ });
    console.log("✅ Successfully connected to MongoDB test");

  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

/*
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
    console.log("✅ Connected");

    // THE NUCLEAR OPTION to delete all baskets before seeding products
    const result = await Basket.deleteMany({});
    console.log(`🧹 DELETED EVERYTHING: ${result.deletedCount} items removed from basket.`);

    // ... rest of your seeding logic
  } catch (err) {
    console.error(err);
  }

  */