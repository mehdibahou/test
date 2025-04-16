import MarketProduct from "@/models/marketproduct";

export default async function getMarketProducts(req) {
  try {
    if (req.method === "GET") {
      const products = await MarketProduct.find();
      console.log(products);

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
