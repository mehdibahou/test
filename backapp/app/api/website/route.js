import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import Savewebsite from "@/controllers/websitecontroller";


const router = createEdgeRouter();

router.use(connectDb).post(Savewebsite);

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
