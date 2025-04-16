const mongoose = require("mongoose");
require("dotenv").config();
const { Performance } = require("./models/performance");

async function migratePerformanceData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB successfully");

    // Find all existing performance documents
    const performances = await Performance.find({});
    console.log(`Found ${performances.length} performance documents to update`);

    // Update each document individually
    let updatedCount = 0;
    let errorCount = 0;

    for (const performance of performances) {
      try {
        // Map the old "competition" field to the new schema
        const oldCompetition = performance.competition || "";

        // Default values for new fields
        const updates = {
          competitionType: "Autre", // Default to "Autre"
          competitionName: oldCompetition, // Use old competition name
          lieu: "Non spécifié", // Default location
        };

        // Remove old competition field
        performance.competition = undefined;

        // Apply updates
        Object.assign(performance, updates);

        // Save the updated document
        await performance.save();
        updatedCount++;
      } catch (err) {
        console.error(`Error updating performance ${performance._id}:`, err);
        errorCount++;
      }
    }

    console.log(`Migration completed:`);
    console.log(`- ${updatedCount} documents updated successfully`);
    console.log(`- ${errorCount} documents failed to update`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the migration
migratePerformanceData();
