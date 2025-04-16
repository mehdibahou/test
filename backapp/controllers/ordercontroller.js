import mongoose from "mongoose";
import Order from "@/models/order";
import Analytics from "@/models/analytics";
import isTokenValid from "@/utils/validateToken";
import FoodProduct from "@/models/product";
import { Type } from "lucide-react";
import Restaurant from "@/models/restaurant";

const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Helper function to get order stats
export const getOrderStats = async () => {
  try {
    const todayStart = getTodayStart();

    // Get today's stats
    const todayStats = await Analytics.findOne({ date: todayStart })
      .select("dailyOrders dailyRevenue")
      .lean();

    // Get total stats
    const totalStats = await Analytics.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: "$dailyOrders" },
          totalRevenue: { $sum: "$dailyRevenue" },
        },
      },
    ]);

    return {
      today: todayStats || { dailyOrders: 0, dailyRevenue: 0 },
      total: totalStats[0] || { totalOrders: 0, totalRevenue: 0 },
    };
  } catch (error) {
    console.error("Error getting order stats:", error);
    throw error;
  }
};

// Main order creation function
export const Makeorder = async (req) => {
  try {
    const {
      orderItems,
      subtotal,
      total,
      notes,
      tableNumber,
      diningOption,
      priceType,

    } = await req.json();
    console.log("Subtotal:", subtotal);

    // Validate access token
    const accessToken = req.headers.get("Cookie")?.split("accessToken=")[1];
    if (!accessToken) {
      return new Response(
        JSON.stringify({ message: "Access token is missing" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = await isTokenValid(accessToken);
    console.log(orderItems);

    // Get product details
    const productIds = orderItems.map(
      (item) => new mongoose.Types.ObjectId(item.product)
    );
    const products = await FoodProduct.find({ _id: { $in: productIds } });

    // Create a map of product details for easy lookup
    const productMap = products.reduce((map, product) => {
      map[product._id.toString()] = product;
      return map;
    }, {});

    // Prepare product sales data
    const productSalesUpdates = orderItems.map((item) => ({
      productName: productMap[item.product].name,
      revenue: item.price * item.quantity,
      orders: item.quantity,
    }));

    // Create order
    const order = new Order({
      orderItems: orderItems,
      total: total,
      customer: "ahmed",
      userId: token.userId,
      productNames: products.map((product) => product.name),
      type:diningOption,
      restaurant: token.userId,
    });

    // Save order and update analytics
    const todayStart = getTodayStart();
    const currentHour = new Date().getHours();

    await Promise.all([
      order.save(),
      Analytics.findOneAndUpdate(
        { date: todayStart },
        {
          $inc: {
            dailyRevenue: Subtotal,
            totalRevenue: Subtotal,
            dailyOrders: 1,
            totalOrders: 1,
            [`hourlyStats.${currentHour}.revenue`]: Subtotal,
            [`hourlyStats.${currentHour}.orders`]: 1,
          },
          $push: {
            productSales: {
              $each: productSalesUpdates,
            },
          },
          $setOnInsert: {
            [`hourlyStats.${currentHour}.hour`]: currentHour,
          },
        },
        {
          upsert: true,
          setDefaultsOnInsert: true,
        }
      ),
    ]);

    return new Response(
      JSON.stringify({
        message: "Order successful",
        orderId: order._id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing order:", error);
    return new Response(
      JSON.stringify({
        message: "Error processing order",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
