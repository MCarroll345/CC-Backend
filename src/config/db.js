// src/config/db.js

const mongoose = require('mongoose');
const Product = require('../models/Product'); // Needed for seeding
const Basket = require('../models/Basket'); // Import the model

const connectDB = async () => {

  try {

    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined in environment');
    await mongoose.connect(uri, { /* options */ });
    console.log("✅ Successfully connected to MongoDB");

    // Seeding Logic moved here
    const seedProducts = [
      { name: 'tshirt', price: 20, description: 'Large green tshirt', image: 'base64string...' },
      // Add more seed items here if desired
    ];

    for (const p of seedProducts) {
      const exists = await Product.findOne({ name: p.name });
      if (!exists) {
        await Product.create(p);
        console.log(`🟢 Seeded product: ${p.name}`);
      }
    }

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