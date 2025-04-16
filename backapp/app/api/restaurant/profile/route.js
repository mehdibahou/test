// app/api/restaurant/profile/route.js
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { authenticateUser } from "@/middlewares/auth";
import Restaurant from "@/models/restaurant";

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

      return new Response(JSON.stringify(restaurant), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching restaurant profile:", error);

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
