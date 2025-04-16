// migration-script.js
const mongoose = require("mongoose");
require("dotenv").config(); // To load your MongoDB connection string from .env file

// Import your Horse model
const { Horse } = require("./models/horse"); // Update this path

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB successfully");

    // Find all existing horse documents
    const horses = await Horse.find({});
    console.log(`Found ${horses.length} horse documents to update`);

    // Update schema for all documents by adding the new fields with null values
    const updateResult = await Horse.updateMany(
      {
        $or: [
          { Provenance: { $exists: false } },
          { Taille: { $exists: false } },
          { Puce: { $exists: false } },
          { Detachement: { $exists: false } },
        ],
      },
      {
        $set: {
          Provenance: null,
          Taille: null,
          Puce: null,
          Detachement: null,
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
