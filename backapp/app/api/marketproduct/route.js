import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";

import addproduct from "@/controllers/marketproductcontroller";
import { authenticateUser } from "@/middlewares/auth";
const router = createEdgeRouter();

router.use(connectDb).use(authenticateUser).post(addproduct);

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
