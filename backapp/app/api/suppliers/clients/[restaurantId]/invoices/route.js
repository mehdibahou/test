// app/api/suppliers/clients/[restaurantId]/invoices/route.js
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { authenticateUser } from "@/middlewares/auth";
import MarketOrder from "@/models/marketorder"; // Assuming this is your order model
import User from "@/models/user";

const router = createEdgeRouter();

router
  .use(connectDb)
  .use(authenticateUser)
  .get(async (req, { params }) => {
    try {
      const { restaurantId } = params;
      const userId = req.userId;
      console.log(restaurantId, userId, "fklzefzelkzefjkfljzeklfze");
      // Find the user to check if they are a supplier
      const user = await User.findById(userId);

      if (!user) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Find all invoices (factures) for this restaurant from this supplier
      // This is a simplified query - adjust according to your actual data model
      const invoices = await MarketOrder.find({
        restaurant: restaurantId,
        // supplier: userId,
      }).sort({ createdAt: -1 });
      console.log(invoices, "invoices");
      return new Response(JSON.stringify(invoices), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching client invoices:", error);

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
