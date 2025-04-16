import { verifyToken } from "@/controllers/authcontroller"; 
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";

// Create the router
const router = createEdgeRouter();

// Apply the middleware and route handler
router.use(connectDb).get(verifyToken);
// Define the handler function
export async function GET(request, ctx) {
  return router.run(request, ctx);
}
