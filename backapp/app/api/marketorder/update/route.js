// /app/api/orders/route.js
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { UpdateMarketorder } from "@/controllers/marketordercontroller";
import { authenticateUser } from "@/middlewares/auth";

const router = createEdgeRouter();

router
  .use(connectDb)
  .use(authenticateUser)
    .put(UpdateMarketorder)
    ;

export async function PUT(request, ctx) {
    return router.run(request, ctx);
    }
    
