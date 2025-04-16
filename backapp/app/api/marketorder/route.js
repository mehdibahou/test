// /app/api/orders/route.js
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { SaveMarketorder,Getmarketorders } from "@/controllers/marketordercontroller";
import { authenticateUser } from "@/middlewares/auth";

const router = createEdgeRouter();

router
  .use(connectDb)
  .use(authenticateUser)
  .post(SaveMarketorder)
  .get(Getmarketorders)
  ;

export async function POST(request, ctx) {
  return router.run(request, ctx);
}

export async function GET(request, ctx) {
  return router.run(request, ctx);
}