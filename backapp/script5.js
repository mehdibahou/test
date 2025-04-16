// migration-date-rappel-username.js
const mongoose = require("mongoose");
require("dotenv").config(); // To load your MongoDB connection string from .env file

// Import your Test model
const { Test } = require("./models/test"); // Update this path if needed

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB successfully");

    // Find all existing test documents
    const tests = await Test.find({});
    console.log(`Found ${tests.length} test documents to update`);

    // Update schema for all documents by adding the new fields with default values
    const updateResult = await Test.updateMany(
      {
        $or: [
          { dateRappel: { $exists: false } },
          { username: { $exists: false } },
        ],
      },
      {
        $set: {
          dateRappel: null,
          username: "",
        },
      }
    );

    console.log(`Updated ${updateResult.modifiedCount} documents`);
    console.log(`${updateResult.matchedCount} documents matched the query`);

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
