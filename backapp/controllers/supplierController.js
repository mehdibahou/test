// controllers/supplierController.js
import Supplier from "@/models/supplier";

export default async function getSuppliers(req) {
  try {
    if (req.method === "GET") {
      const suppliers = await Supplier.find({ isActive: true });

      return new Response(JSON.stringify(suppliers), {
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
    console.error("Error fetching suppliers:", error);

    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
