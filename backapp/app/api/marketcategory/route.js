import { createEdgeRouter } from "next-connect";
import connectDb from "@/middlewares/ConnectDB";
import { MarketcategoryController } from "@/controllers/marketcategorycontroller";
import { authenticateUser } from "@/middlewares/auth";

const router = createEdgeRouter();

// Configure the router
router
  .use(connectDb)
  .use(authenticateUser)
  .get(MarketcategoryController.getAll)
  .post(MarketcategoryController.create);

// Export both GET and POST handlers
export async function GET(request, ctx) {
  return router.run(request, ctx);
}

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
