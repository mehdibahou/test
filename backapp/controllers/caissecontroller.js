import MarketProduct from "@/models/marketproduct";
import FoodProduct from "@/models/product";
import User from "@/models/user";

export default async function getProducts(req) {
  console.log("GET request received");
  try {
    if (req.method === "GET") {
      const userid = req.userId;
      const user = await User.findOne({ _id: userid });
      const restaurantId = user.restaurantId;
      const products = await FoodProduct.find({
        restaurantId: restaurantId,
      })
      // Return the products as a JSON response
      return new Response(JSON.stringify(products), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching products:", error);

    // Return an error response
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
