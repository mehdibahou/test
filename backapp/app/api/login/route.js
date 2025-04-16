import testController from "@/controllers/authcontroller";
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { login } from "@/controllers/authcontroller";// Define the router without TypeScript annotations
const router = createEdgeRouter();

router.use(connectDb).post(login);

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
