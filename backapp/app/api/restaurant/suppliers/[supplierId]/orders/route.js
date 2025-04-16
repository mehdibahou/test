// app/api/restaurant/suppliers/[supplierId]/orders/route.js
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { authenticateUser } from "@/middlewares/auth";
import MarketOrder from "@/models/marketorder";
import Restaurant from "@/models/restaurant";

const router = createEdgeRouter();

router
  .use(connectDb)
  .use(authenticateUser)
  .get(async (req, { params }) => {
    try {
      const { supplierId } = params;
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

      // Find all orders between this restaurant and the specified supplier
      const orders = await MarketOrder.find({
        restaurant: restaurant._id,
        supplier: supplierId,
      }).sort({ createdAt: -1 });

      return new Response(JSON.stringify(orders), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching supplier orders:", error);

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
