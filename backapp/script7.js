// migration-maladies.js - Run with: node migration-maladies.js
const mongoose = require("mongoose");
require("dotenv").config(); // To load your MongoDB connection string from .env file

// Import your Prophylaxie model
const { Prophylaxie } = require("./models/prophylaxie"); // Update this path if needed

async function migrateMaladiesData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB successfully");

    // Find all existing vaccination prophylaxie documents
    const prophylaxies = await Prophylaxie.find({ type: "Vaccination" });
    console.log(
      `Found ${prophylaxies.length} vaccination prophylaxie documents to update`
    );

    let updatedCount = 0;
    let errorCount = 0;

    // Process each document
    for (const prophylaxie of prophylaxies) {
      try {
        // Skip documents that already have the maladies array
        if (
          prophylaxie.details &&
          Array.isArray(prophylaxie.details.maladies) &&
          prophylaxie.details.maladies.length > 0
        ) {
          console.log(
            `Skipping prophylaxie ${prophylaxie._id} - already has maladies array`
          );
          continue;
        }

        // Get the old maladie value
        const oldMaladie =
          prophylaxie.details && prophylaxie.details.maladie
            ? prophylaxie.details.maladie
            : null;

        if (!oldMaladie) {
          console.log(
            `Skipping prophylaxie ${prophylaxie._id} - no maladie value`
          );
          continue;
        }

        // Create an array with the old value
        const maladiesArray = [oldMaladie];

        // Update the document
        await Prophylaxie.updateOne(
          { _id: prophylaxie._id },
          { $set: { "details.maladies": maladiesArray } }
        );

        updatedCount++;
        console.log(`Updated prophylaxie ${prophylaxie._id}`);
      } catch (error) {
        console.error(`Error updating prophylaxie ${prophylaxie._id}:`, error);
        errorCount++;
      }
    }

    console.log(
      `Migration completed with ${updatedCount} documents updated successfully`
    );
    if (errorCount > 0) {
      console.log(`${errorCount} documents failed to update`);
    }
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the migration
migrateMaladiesData();
