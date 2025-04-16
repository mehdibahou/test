// /app/api/orders/route.js
import connectDb from "@/middlewares/ConnectDB";
import { createEdgeRouter } from "next-connect";
import { NextRequest } from "next/server";
import { CancelMarketorder } from "@/controllers/marketordercontroller";
import { authenticateUser } from "@/middlewares/auth";

const router = createEdgeRouter();

router
  .use(connectDb)
  .use(authenticateUser)
    .delete(CancelMarketorder)
    ;

export async function DELETE(request, ctx) {
    return router.run(request, ctx);
    }
//
//
