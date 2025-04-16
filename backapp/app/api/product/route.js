import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import addproduct from "@/controllers/productcontroller";
import { authenticateUser } from "@/middlewares/auth";
const router = createEdgeRouter();

router.use(connectDb).use(authenticateUser).post(addproduct);

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
