// migrate-prophylaxie-types.js
const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
async function migrateData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully");

    // Define simplified Prophylaxie schema for migration
    const prophylaxieSchema = new mongoose.Schema(
      {
        horse: mongoose.Schema.Types.ObjectId,
        type: String,
        types: [String],
        date: Date,
        dateRappel: Date,
        details: mongoose.Schema.Types.Mixed,
        notes: String,
        file: [String],
        createdBy: mongoose.Schema.Types.ObjectId,
        isRadie: Boolean,
      },
      { timestamps: true }
    );

    // Create temporary model using prophylaxies collection
    const Prophylaxie = mongoose.model(
      "Prophylaxie",
      prophylaxieSchema,
      "prophylaxies"
    );

    // Count total documents before migration
    const totalDocuments = await Prophylaxie.countDocuments();
    console.log(`Total prophylaxie documents: ${totalDocuments}`);

    // Add 'types' array field to documents that don't have it
    const updateResult = await Prophylaxie.updateMany(
      { types: { $exists: false } },
      [
        {
          $set: {
            types: {
              $cond: {
                if: { $ne: ["$type", null] },
                then: ["$type"],
                else: [],
              },
            },
          },
        },
      ]
    );

    console.log(
      `Updated ${updateResult.modifiedCount} documents with 'types' field`
    );

    // Add multipleTypesDetails map to details if not exists
    const detailsUpdateResult = await Prophylaxie.updateMany(
      { "details.multipleTypesDetails": { $exists: false } },
      { $set: { "details.multipleTypesDetails": {} } }
    );

    console.log(
      `Updated ${detailsUpdateResult.modifiedCount} documents with 'multipleTypesDetails' field`
    );

    // Validate migration by checking a few records
    const sampleRecords = await Prophylaxie.find().limit(5);

    console.log("\nSample records after migration:");
    sampleRecords.forEach((record) => {
      console.log(`ID: ${record._id}`);
      console.log(`Type: ${record.type}`);
      console.log(`Types array: ${record.types}`);
      console.log("-------------------------");
    });

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the migration
migrateData();
