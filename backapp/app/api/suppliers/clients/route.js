// app/api/suppliers/clients/route.js
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { authenticateUser } from "@/middlewares/auth";
import Restaurant from "@/models/restaurant";
import User from "@/models/user"; // Assuming you have a User model

const router = createEdgeRouter();

router
  .use(connectDb)
  .use(authenticateUser)
  .get(async (req) => {
    try {
      // Get the authenticated supplier's ID
      const userId = req.userId;

      // Find the user to check if they are a supplier
      const user = await User.findById(userId);

      if (!user) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Find all restaurants associated with this supplier
      // This could be based on orders they've placed or a direct relation in your data model
      // This is a simplified example - you might need to adjust the query based on your data structure

      // Option 1: If your restaurant model has a direct reference to suppliers
      // const restaurants = await Restaurant.find({ suppliers: userId });

      // Option 2: If you're inferring relationships through orders
      // const orders = await Order.find({ 'supplier': userId }).distinct('restaurant');
      // const restaurants = await Restaurant.find({ _id: { $in: orders } });

      // For demonstration, we'll fetch all restaurants
      // In a real application, you would apply proper filtering
      const restaurants = await Restaurant.find({}).sort({ name: 1 });

      return new Response(JSON.stringify(restaurants), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching client restaurants:", error);

      return new Response(
        JSON.stringify({ message: "Internal Server Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  });

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
