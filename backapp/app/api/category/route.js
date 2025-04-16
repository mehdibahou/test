import { createEdgeRouter } from "next-connect";
import connectDb from "@/middlewares/ConnectDB";
import { categoryController } from "@/controllers/categorycontroller";
import { authenticateUser } from "@/middlewares/auth";

const router = createEdgeRouter();

// Configure the router
router
  .use(connectDb)
  .use(authenticateUser)
  .get(categoryController.getAll)
  .post(categoryController.create)
  .put(categoryController.update)
  .delete(categoryController.delete);


// Export both GET and POST handlers
export async function GET(request, ctx) {
  return router.run(request, ctx);
}

export async function POST(request, ctx) {
  return router.run(request, ctx);
}
