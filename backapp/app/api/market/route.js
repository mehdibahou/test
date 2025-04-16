import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import getMarketProducts from "@/controllers/marketcontroller";
import { authenticateUser } from "@/middlewares/auth";
const router = createEdgeRouter();

router.use(connectDb).use(authenticateUser).get(getMarketProducts);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
