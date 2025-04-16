// app/api/suppliers/route.js
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import getSuppliers from "@/controllers/supplierController";
import { authenticateUser } from "@/middlewares/auth";

const router = createEdgeRouter();

router.use(connectDb).use(authenticateUser).get(getSuppliers);

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
