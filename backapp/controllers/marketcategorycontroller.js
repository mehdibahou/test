import { NextResponse } from "next/server";
import MarketCategory from "../models/marketcategory";
import { put } from "@vercel/blob";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const MarketcategoryController = {
  // Create category
  async create(req) {
    try {
      console.log("Starting category creation...");

      const formData = await req.formData();
      console.log("FormData received:", Object.fromEntries(formData));

      const name = formData.get("name");
      const description = formData.get("description");
      const file = formData.get("image");

      // Validate inputs
      if (!name || !description || !file) {
        console.log("Missing required fields:", { name, description, file });
        return NextResponse.json(
          { message: "Please provide all required fields" },
          { status: 400 }
        );
      }

      // Check for existing category
      const existingCategory = await MarketCategory.findOne({ name });
      if (existingCategory) {
        console.log("Category already exists:", name);
        return NextResponse.json(
          { message: "Category with this name already exists" },
          { status: 400 }
        );
      }

      try {
        // Upload file to Vercel Blob
        const fileType = file.type;
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}-${file.name}`;
        const blob = new Blob([await file.arrayBuffer()], { type: fileType });

        const { url } = await put(`categories/${fileName}`, blob, {
          access: "public",
          contentType: fileType,
        });

        console.log("File uploaded successfully to Vercel Blob:", url);

        // Create category in database
        const category = await MarketCategory.create({
          name,
          description,
          image: url, // Store the Vercel Blob URL
        });

        console.log("Category created successfully:", category);

        return NextResponse.json(category, { status: 201 });
      } catch (uploadError) {
        console.error("Error uploading file:", uploadError);
        return NextResponse.json(
          { message: "Failed to upload image" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error in category creation:", error);
      return NextResponse.json(
        { message: error.message || "Error creating category" },
        { status: 500 }
      );
    }
  },

  async getAll(req) {
    try {
      console.log("Fetching all categories...");
      const categories = await MarketCategory.find({});
      console.log("Categories fetched successfully:", categories);
      return NextResponse.json(categories, { status: 200 });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { message: "Error fetching categories" },
        { status: 500 }
      );
    }
  },
};

// Route handler
export async function POST(req) {
  try {
    console.log("POST request received");
    return await categoryController.create(req);
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    console.log("GET request received");
    return await categoryController.getAll(req);
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
