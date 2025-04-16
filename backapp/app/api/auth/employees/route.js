import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { getEmployees, register } from "@/controllers/employeereg";// Define the router without TypeScript annotations
import { authenticateUser } from "@/middlewares/auth";
const router = createEdgeRouter();

router.use(connectDb).use(authenticateUser).post(register)
.get(getEmployees);

export async function POST(request, ctx) {
  return router.run(request, ctx);
}

export async function GET(request, ctx) {
  return router.run(request, ctx);
}
