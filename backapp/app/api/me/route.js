import  { me } from "@/controllers/authcontroller";
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";

import { authenticateUser } from "@/middlewares/auth";
const router = createEdgeRouter();

router.use(connectDb).use(authenticateUser).get(me);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
