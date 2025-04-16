import { put } from "@vercel/blob";
import MarketProduct from "@/models/marketproduct";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "@/errors/bad-request";

export const config = {
  api: {
    bodyParser: false, // Disables Next.js' default body parsing
  },
};

export default async function addproduct(req, res) {
  if (req.method === "POST") {
    const formData = await req.formData();

    // Get form fields
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const unity = formData.get("unity");
    let file = formData.get("image");
    const category = formData.get("category");

    // Process variants
    const variants = [];
    let index = 0;
    while (formData.get(`variants[${index}][variantName]`)) {
      variants.push({
        variantName: formData.get(`variants[${index}][variantName]`),
        price: formData.get(`variants[${index}][price]`),
      });
      index++;
    }

    // Validation
    if (!name || !price || !description) {
      throw new BadRequestError("Please fill all fields");
    }

    let urlfile;
    let datafile;

    if (file === "null") {
      urlfile =
        "https://v5g9homkdadvaysf.public.blob.vercel-storage.com/products/wxgbt-Restaurantes_01-XYVn8xG4dXwbcgFTOInGlentIVUotp.jpg";
    }
    if (file !== "null") {
      const fileType = file.type;
      const fileName = `${Math.random().toString(36).substring(7)}-${
        file.name
      }`;
      const blob = new Blob([await file.arrayBuffer()], { type: fileType });

      datafile = await put(`products/${fileName}`, blob, {
        access: "public",
        contentType: fileType,
      });
    }

    const image = file !== "null" ? datafile?.url : urlfile;

    try {
      // Upload file to Vercel Blob

      // Create product in database
      const product = await MarketProduct.create({
        name,
        description,
        price,
        unity,
        image,
        category,
      });

      return new Response(
        JSON.stringify({
          message: "Product added successfully",
          product,
        }),
        {
          status: StatusCodes.OK,
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      return new Response(
        JSON.stringify({
          message: "Error uploading file",
          error: error.message,
        }),
        {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        }
      );
    }
  }
}
