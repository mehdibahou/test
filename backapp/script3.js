// scripts/migration-radiation.js
const mongoose = require("mongoose");
require("dotenv").config(); // To load your MongoDB connection string from .env file

// Import your models
const { Horse } = require("./models/horse");
const { Test } = require("./models/test");
const { Performance } = require("./models/performance");
const { Prophylaxie } = require("./models/prophylaxie");

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB successfully");

    // Migration for Horse model - add radiation fields
    const horseUpdateResult = await Horse.updateMany(
      { isRadie: { $exists: false } },
      {
        $set: {
          isRadie: false,
          motifderadiation: null,
          dateRadiation: null,
          cause: null,
          motif: null,
          reference: null,
        },
      }
    );

    console.log("Horse migration results:");
    console.log(`Updated ${horseUpdateResult.modifiedCount} horses`);
    console.log(`${horseUpdateResult.matchedCount} horses matched the query`);

    // Migration for Test model - add isRadie field
    const testUpdateResult = await Test.updateMany(
      { isRadie: { $exists: false } },
      { $set: { isRadie: false } }
    );

    console.log("Test migration results:");
    console.log(`Updated ${testUpdateResult.modifiedCount} tests`);
    console.log(`${testUpdateResult.matchedCount} tests matched the query`);

    // Migration for Performance model - add isRadie field
    const performanceUpdateResult = await Performance.updateMany(
      { isRadie: { $exists: false } },
      { $set: { isRadie: false } }
    );

    console.log("Performance migration results:");
    console.log(
      `Updated ${performanceUpdateResult.modifiedCount} performances`
    );
    console.log(
      `${performanceUpdateResult.matchedCount} performances matched the query`
    );

    // Migration for Prophylaxie model - add isRadie field
    const prophylaxieUpdateResult = await Prophylaxie.updateMany(
      { isRadie: { $exists: false } },
      { $set: { isRadie: false } }
    );

    console.log("Prophylaxie migration results:");
    console.log(
      `Updated ${prophylaxieUpdateResult.modifiedCount} prophylaxies`
    );
    console.log(
      `${prophylaxieUpdateResult.matchedCount} prophylaxies matched the query`
    );

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the migration
migrateData();
