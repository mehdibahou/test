import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { get } from "mongoose";
import { getwebsite } from "@/controllers/websitecontroller";
const router = createEdgeRouter();

router.use(connectDb).get(getwebsite);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
