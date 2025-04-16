import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { Getorders, Patchstatus } from "@/controllers/getorderscontroller";
import { authenticateUser } from "@/middlewares/auth";

const router = createEdgeRouter();

router
 .use(connectDb)
 .use(authenticateUser)
 .get(Getorders)
 .patch(Patchstatus);

export async function GET(request) {
 return router.run(request);
}

export async function PATCH(request) {
 return router.run(request); 
}