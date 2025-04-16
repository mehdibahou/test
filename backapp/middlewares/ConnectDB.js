import mongoose from 'mongoose';

// Garder le track de l'état de la connexion
let isConnected = false;

const connectDb = async (req, res, next) => {
  try {
    // Vérifier si déjà connecté
    if (isConnected) {
      console.log("Utilisation de la connexion existante");
      return await next();
    }

    // Vérifier si déjà en train de se connecter
    if (mongoose.connections[0].readyState) {
      isConnected = true;
      console.log("Connexion existante détectée");
      return await next();
    }

    // Nouvelle connexion
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI manquant dans les variables d'environnement");
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });

    isConnected = true;
    console.log("Nouvelle connexion MongoDB établie");
    return await next();

  } catch (error) {
    console.error("Erreur de connexion MongoDB:", error);
    isConnected = false;
    // Retourner une réponse d'erreur appropriée
    return new Response(
      JSON.stringify({ error: "Erreur de connexion à la base de données" }),
      { status: 500 }
    );
  }
};

// Gérer la déconnexion proprement
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Connexion MongoDB fermée suite à l\'arrêt de l\'application');
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la fermeture de la connexion:', err);
    process.exit(1);
  }
});

export default connectDb;