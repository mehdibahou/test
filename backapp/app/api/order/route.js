// /app/api/orders/route.js
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { Makeorder, getOrderStats } from "@/controllers/ordercontroller";
import { authenticateUser } from "@/middlewares/auth";

const router = createEdgeRouter();

router
  .use(connectDb)
  .use(authenticateUser)
  .post(Makeorder)
  .get(async (req) => {
    try {
      const stats = await getOrderStats();
      return new Response(JSON.stringify(stats), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });

export async function POST(request, ctx) {
  return router.run(request, ctx);
}

export async function GET(request, ctx) {
  return router.run(request, ctx);
}