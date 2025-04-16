import { put } from "@vercel/blob";
import FoodProduct from "@/models/product";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "@/errors/bad-request";
import Restaurant from "@/models/restaurant";
import User from "@/models/user";
import isTokenValid from "@/utils/validateToken";
import { getCookies } from "cookies-next";


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
    const glovoprice = formData.get("glovoprice");
    const off = formData.get("off");
    let file = formData.get("image");
    const category = formData.get("category");
    
    const cookies = await getCookies({ req, res });
      const  accessToken = cookies.accessToken;
      console.log(accessToken,"accessToken");
const userId = (await isTokenValid(accessToken)).userId;

    const store = await Restaurant.findOne({ owner: userId });  

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

    let image;

// Check if file exists and is not null/undefined
if (file && file !== "null" && file instanceof Blob) {
    const fileName = `${Math.random().toString(36).substring(7)}-${file.name}`;
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    
    const datafile = await put(`products/${fileName}`, blob, {
        access: "public",
        contentType: file.type,
    });
    image = datafile.url;
} else {
    // Default image if no file is uploaded
    image = "https://v5g9homkdadvaysf.public.blob.vercel-storage.com/products/wxgbt-Restaurantes_01-XYVn8xG4dXwbcgFTOInGlentIVUotp.jpg";
}
    try {
      // Upload file to Vercel Blob

      // Create product in database
      const product = await FoodProduct.create({
        name,
        description,
        price,
        off,
        glovoprice,
        image,
        variants: variants,
        category: category,
        restaurant: store,
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
