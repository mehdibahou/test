import { connect } from "mongoose";

let isConnected = false; // Tracks the database connection status

const connectDb = async (req, res, next) => {
  if (!isConnected) {
    try {
      const connection = await connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      isConnected = connection.connections[0].readyState === 1; // Set to true if connected
      console.log("DB connected");
    } catch (error) {
      console.error("DB connection error:", error);
      return res.status(500).json({ error: "Database connection failed" });
    }
  }
  return next(); // Pass control to the next middleware or request handler
};

export default connectDb;
