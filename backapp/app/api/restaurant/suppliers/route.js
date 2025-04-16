// app/api/restaurant/suppliers/route.js
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { authenticateUser } from "@/middlewares/auth";
import User from "@/models/user";
import Restaurant from "@/models/restaurant";
import MarketOrder from "@/models/marketorder";

const router = createEdgeRouter();

router
  .use(connectDb)
  .use(authenticateUser)
  .get(async (req) => {
    try {
      // Get the authenticated user's ID
      const userId = req.userId;

      // Find the restaurant owned by this user
      const restaurant = await Restaurant.findOne({ owner: userId });

      if (!restaurant) {
        return new Response(
          JSON.stringify({ message: "Restaurant not found for this user" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      console.log(restaurant, " restaurant found");
      // Find all suppliers that have orders with this restaurant
      const suppliersWithOrders = await MarketOrder.aggregate([
        // Match orders for this restaurant
        { $match: { restaurant: restaurant._id } },
        // Group by supplier
        { $group: { _id: "$supplier" } },
      ]);

      const supplierIds = suppliersWithOrders.map((item) => item._id);
      console.log(supplierIds, "jhjkhkjh");
      // Get the supplier details
      const suppliers = await User.find({
        _id: { $in: supplierIds },
      }).select("name email phone role");

      return new Response(JSON.stringify(suppliers), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching suppliers:", error);

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
