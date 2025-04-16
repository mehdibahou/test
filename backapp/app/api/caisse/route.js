import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import getProducts from "@/controllers/caissecontroller";
import { authenticateUser } from "@/middlewares/auth";
const router = createEdgeRouter();

router.use(connectDb).use(authenticateUser).get(getProducts);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
