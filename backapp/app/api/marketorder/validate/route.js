// /app/api/orders/route.js
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { ValidateMarketorder } from "@/controllers/marketordercontroller";
import { authenticateUser } from "@/middlewares/auth";

const router = createEdgeRouter();

router
  .use(connectDb)
  .use(authenticateUser)
    .put(ValidateMarketorder)
    ;

export async function PUT(request, ctx) {
    return router.run(request, ctx);
    }
    
    
