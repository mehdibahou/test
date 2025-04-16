// scripts/seed-clients-data.js
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

// Database connection string from environment variables
const MONGODB_URI =
  "mongodb+srv://ahmedbahou00001:Ma123456789@test.qd0te89.mongodb.net/?retryWrites=true&w=majority&appName=test";

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable");
  process.exit(1);
}

// Function to generate a random date within a range
const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Function to generate a random number within a range
const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Seed data
async function seedDatabase() {
  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();

    // Create supplier users if they don't exist
    // Check if users collection exists
    const collectionsArray = await db.listCollections().toArray();
    const collectionsNames = collectionsArray.map((c) => c.name);

    // Create sample suppliers
    const supplierIds = [];
    const supplierData = [
      {
        name: "FreshFoods Supplier",
        email: "fresh@example.com",
        password:
          "$2a$10$X7.H3kXKAoaVcW1nxgdtXOykCJfYfz3XgCGdP2QE6owbZuWtYHSuy", // hashed 'password123'
        role: "supplier",
        phone: "0601020304",
      },
      {
        name: "Gourmet Goods",
        email: "gourmet@example.com",
        password:
          "$2a$10$X7.H3kXKAoaVcW1nxgdtXOykCJfYfz3XgCGdP2QE6owbZuWtYHSuy",
        role: "supplier",
        phone: "0602030405",
      },
      {
        name: "Prime Produce",
        email: "prime@example.com",
        password:
          "$2a$10$X7.H3kXKAoaVcW1nxgdtXOykCJfYfz3XgCGdP2QE6owbZuWtYHSuy",
        role: "supplier",
        phone: "0603040506",
      },
    ];

    if (collectionsNames.includes("users")) {
      // Check if suppliers already exist
      for (const supplier of supplierData) {
        const existingSupplier = await db
          .collection("users")
          .findOne({ email: supplier.email });
        if (existingSupplier) {
          supplierIds.push(existingSupplier._id);
          console.log(`Supplier ${supplier.name} already exists`);
        } else {
          const result = await db.collection("users").insertOne({
            ...supplier,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          supplierIds.push(result.insertedId);
          console.log(`Created supplier: ${supplier.name}`);
        }
      }
    } else {
      // Create users collection and insert suppliers
      const results = await db.collection("users").insertMany(
        supplierData.map((supplier) => ({
          ...supplier,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
      supplierIds.push(...Object.values(results.insertedIds));
      console.log(`Created ${supplierIds.length} suppliers`);
    }

    // Create restaurant owners if they don't exist
    const ownerIds = [];
    const ownerData = [
      {
        name: "Jean Dupont",
        email: "jean@restaurant.com",
        password:
          "$2a$10$X7.H3kXKAoaVcW1nxgdtXOykCJfYfz3XgCGdP2QE6owbZuWtYHSuy",
        role: "restaurant_owner",
        phone: "0607080910",
      },
      {
        name: "Marie Laurent",
        email: "marie@restaurant.com",
        password:
          "$2a$10$X7.H3kXKAoaVcW1nxgdtXOykCJfYfz3XgCGdP2QE6owbZuWtYHSuy",
        role: "restaurant_owner",
        phone: "0608091011",
      },
      {
        name: "Pierre Martin",
        email: "pierre@restaurant.com",
        password:
          "$2a$10$X7.H3kXKAoaVcW1nxgdtXOykCJfYfz3XgCGdP2QE6owbZuWtYHSuy",
        role: "restaurant_owner",
        phone: "0609101112",
      },
      {
        name: "Sophie Petit",
        email: "sophie@restaurant.com",
        password:
          "$2a$10$X7.H3kXKAoaVcW1nxgdtXOykCJfYfz3XgCGdP2QE6owbZuWtYHSuy",
        role: "restaurant_owner",
        phone: "0610111213",
      },
    ];

    if (collectionsNames.includes("users")) {
      // Check if owners already exist
      for (const owner of ownerData) {
        const existingOwner = await db
          .collection("users")
          .findOne({ email: owner.email });
        if (existingOwner) {
          ownerIds.push(existingOwner._id);
          console.log(`Restaurant owner ${owner.name} already exists`);
        } else {
          const result = await db.collection("users").insertOne({
            ...owner,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          ownerIds.push(result.insertedId);
          console.log(`Created restaurant owner: ${owner.name}`);
        }
      }
    } else {
      // Create users collection and insert owners
      const results = await db.collection("users").insertMany(
        ownerData.map((owner) => ({
          ...owner,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
      ownerIds.push(...Object.values(results.insertedIds));
      console.log(`Created ${ownerIds.length} restaurant owners`);
    }

    // Create restaurants
    const restaurantIds = [];

    // Delete existing restaurants if needed
    // await db.collection('restaurants').deleteMany({});

    // Create new restaurants
    const restaurantData = [
      {
        name: "Le Bistrot Parisien",
        owner: ownerIds[0],
        address: "15 Rue de la Paix",
        city: "Paris",
        postalCode: "75001",
        phone: "0123456789",
        cuisine: "Française traditionnelle",
        seatingCapacity: 45,
        openingHours: "Lun-Sam: 12h-14h30, 19h-22h30",
        status: "active",
        staff: [],
      },
      {
        name: "La Trattoria",
        owner: ownerIds[1],
        address: "8 Avenue des Italiens",
        city: "Lyon",
        postalCode: "69002",
        phone: "0234567890",
        cuisine: "Italienne",
        seatingCapacity: 60,
        openingHours: "Tous les jours: 12h-14h, 19h-23h",
        status: "active",
        staff: [],
      },
      {
        name: "Le Dragon d'Or",
        owner: ownerIds[2],
        address: "22 Rue de Belleville",
        city: "Paris",
        postalCode: "75020",
        phone: "0345678901",
        cuisine: "Asiatique fusion",
        seatingCapacity: 80,
        openingHours: "Mar-Dim: 12h-15h, 18h30-22h30",
        status: "active",
        staff: [],
      },
      {
        name: "El Toro",
        owner: ownerIds[3],
        address: "5 Place de la Comedie",
        city: "Bordeaux",
        postalCode: "33000",
        phone: "0456789012",
        cuisine: "Espagnole",
        seatingCapacity: 50,
        openingHours: "Mer-Lun: 12h-14h, 19h-23h",
        status: "inactive",
        staff: [],
      },
    ];

    // Check if the restaurants collection exists
    if (collectionsNames.includes("restaurants")) {
      for (const restaurant of restaurantData) {
        const existingRestaurant = await db
          .collection("restaurants")
          .findOne({ name: restaurant.name });
        if (existingRestaurant) {
          restaurantIds.push(existingRestaurant._id);
          console.log(`Restaurant ${restaurant.name} already exists`);
        } else {
          const result = await db.collection("restaurants").insertOne({
            ...restaurant,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          restaurantIds.push(result.insertedId);
          console.log(`Created restaurant: ${restaurant.name}`);
        }
      }
    } else {
      // Create restaurants collection
      const results = await db.collection("restaurants").insertMany(
        restaurantData.map((restaurant) => ({
          ...restaurant,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
      restaurantIds.push(...Object.values(results.insertedIds));
      console.log(`Created ${restaurantIds.length} restaurants`);
    }

    // Define sample products that suppliers might provide
    const products = [
      { name: "Tomates", price: 2.49, unity: "kg" },
      { name: "Pommes de terre", price: 1.99, unity: "kg" },
      { name: "Carottes", price: 1.79, unity: "kg" },
      { name: "Poulet entier", price: 8.99, unity: "pièce" },
      { name: "Filet de bœuf", price: 22.99, unity: "kg" },
      { name: "Saumon frais", price: 17.99, unity: "kg" },
      { name: "Farine", price: 1.29, unity: "kg" },
      { name: "Lait", price: 1.09, unity: "litre" },
      { name: "Œufs", price: 2.99, unity: "douzaine" },
      { name: "Huile d'olive", price: 8.99, unity: "litre" },
    ];

    // Create market orders (both bon de commande and facture)
    // First, delete any existing test market orders if needed
    // await db.collection('marketorders').deleteMany({ test: true });

    const numberOfOrders = 20; // Total number of orders to create
    const marketOrders = [];

    for (let i = 0; i < numberOfOrders; i++) {
      // Randomly select a restaurant and supplier
      const restaurant =
        restaurantIds[randomNumber(0, restaurantIds.length - 1)];
      const supplier = supplierIds[randomNumber(0, supplierIds.length - 1)];

      // Create between 1 and 5 order items
      const itemCount = randomNumber(1, 5);
      const items = [];
      const productNames = [];
      let total = 0;

      for (let j = 0; j < itemCount; j++) {
        const product = products[randomNumber(0, products.length - 1)];
        const quantity = randomNumber(1, 10);
        const price = product.price;

        items.push({
          product: new ObjectId(), // This would normally be a product ID
          quantity,
          price,
        });

        productNames.push(`${product.name} (${product.unity})`);
        total += price * quantity;
      }

      // Randomly determine if this is a bon de commande or facture
      const isFacture = Math.random() > 0.6; // 40% are factures

      // Create an order date (within last 3 months)
      const orderDate = randomDate(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        new Date()
      );

      // Determine status based on state and random factors
      let status = "pending";
      if (isFacture) {
        // Factures are always completed
        status = "completed";
      } else {
        // Bon de commande can be in various states
        const statusOptions = [
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ];
        const statusWeights = [0.3, 0.3, 0.2, 0.1, 0.1]; // Weights for random selection

        const randomValue = Math.random();
        let cumulativeWeight = 0;

        for (let k = 0; k < statusOptions.length; k++) {
          cumulativeWeight += statusWeights[k];
          if (randomValue <= cumulativeWeight) {
            status = statusOptions[k];
            break;
          }
        }
      }

      // Create random notes (30% chance of having notes)
      const hasNotes = Math.random() < 0.3;
      const notesOptions = [
        "Livraison à l'arrière du restaurant",
        "Merci de livrer avant 10h",
        "Demander le chef à l'arrivée",
        "Produits bio uniquement",
        "Besoin urgent pour le service du soir",
      ];
      const notes = hasNotes
        ? notesOptions[randomNumber(0, notesOptions.length - 1)]
        : "";

      marketOrders.push({
        items,
        productNames,
        total,
        state: isFacture ? "facture" : "bon de commande",
        status,
        notes,
        restaurant,
        supplier,
        createdAt: orderDate,
        updatedAt: orderDate,
        test: true, // Mark as test data
      });
    }

    // Insert market orders
    const orderResults = await db
      .collection("marketorders")
      .insertMany(marketOrders);
    console.log(`Created ${orderResults.insertedCount} market orders`);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the connection
    if (client) {
      await client.close();
      console.log("Database connection closed");
    }
  }
}

// Run the seed function
seedDatabase();
