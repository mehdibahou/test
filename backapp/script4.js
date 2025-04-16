// scripts/migration-mutation.js
const mongoose = require("mongoose");
require("dotenv").config(); // Pour charger la chaîne de connexion MongoDB depuis le fichier .env

// Importer les modèles
const { Horse } = require("./models/horse");
const { Test } = require("./models/test");
const { Performance } = require("./models/performance");
const { Prophylaxie } = require("./models/prophylaxie");

async function migrateData() {
  try {
    // Se connecter à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connecté à MongoDB avec succès");

    // Migration pour le modèle Horse - ajouter les champs de mutation
    const horseUpdateResult = await Horse.updateMany(
      { isMutated: { $exists: false } },
      {
        $set: {
          isMutated: false,
          dateMutation: null,
          nouvelleAffectation: null,
          mutationReference: null,
        },
      }
    );

    console.log("Résultats de la migration Horse:");
    console.log(`${horseUpdateResult.modifiedCount} chevaux mis à jour`);
    console.log(
      `${horseUpdateResult.matchedCount} chevaux correspondaient à la requête`
    );

    // Migration pour le modèle Test - ajouter le champ isMutated
    const testUpdateResult = await Test.updateMany(
      { isMutated: { $exists: false } },
      { $set: { isMutated: false } }
    );

    console.log("Résultats de la migration Test:");
    console.log(`${testUpdateResult.modifiedCount} tests mis à jour`);
    console.log(
      `${testUpdateResult.matchedCount} tests correspondaient à la requête`
    );

    // Migration pour le modèle Performance - ajouter le champ isMutated
    const performanceUpdateResult = await Performance.updateMany(
      { isMutated: { $exists: false } },
      { $set: { isMutated: false } }
    );

    console.log("Résultats de la migration Performance:");
    console.log(
      `${performanceUpdateResult.modifiedCount} performances mises à jour`
    );
    console.log(
      `${performanceUpdateResult.matchedCount} performances correspondaient à la requête`
    );

    // Migration pour le modèle Prophylaxie - ajouter le champ isMutated
    const prophylaxieUpdateResult = await Prophylaxie.updateMany(
      { isMutated: { $exists: false } },
      { $set: { isMutated: false } }
    );

    console.log("Résultats de la migration Prophylaxie:");
    console.log(
      `${prophylaxieUpdateResult.modifiedCount} prophylaxies mises à jour`
    );
    console.log(
      `${prophylaxieUpdateResult.matchedCount} prophylaxies correspondaient à la requête`
    );

    console.log("Migration terminée avec succès");
  } catch (error) {
    console.error("Échec de la migration:", error);
  } finally {
    // Fermer la connexion MongoDB
    await mongoose.connection.close();
    console.log("Connexion MongoDB fermée");
  }
}

// Exécuter la migration
migrateData();
