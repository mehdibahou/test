import { NextResponse } from "next/server";
import Category from "../models/category";
import { put } from "@vercel/blob";
import User from "@/models/user";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const categoryController = {
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
      const userid = req.userId;
      const user = await User.findOne({ _id: userid })
      const restaurant = user.restaurantId;
      // Check for existing category
      const existingCategory = await Category.findOne({ name, restaurant });
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
        const category = await Category.create({
          name,
          description,
          image: url, // Store the Vercel Blob URL
          restaurant: restaurant
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
      const userid = req.userId;
      const user = await User.findOne({ _id: userid });
      const restaurant = user.restaurantId;
      const categories = await Category.find({ restaurant });
      return NextResponse.json(categories, { status: 200 });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { message: "Error fetching categories" },
        { status: 500 }
      );
    }
  },

  async update(req) {
    try {
      console.log("Starting category update...");

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
      const userid = req.userId;
      const user = await User.findOne({ _id: userid })
      const restaurant = user.restaurantId;
      const existingCategory = await Category.findOne({ name, restaurant });
      if (!existingCategory) {
        console.log("Category does not exist:", name);
        return NextResponse.json(
          { message: "Category does not exist" },
          { status: 404 }
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

        // Update category in database
        const category = await Category.findOneAndUpdate(
          { name, restaurant },
          { description, image: url },
          { new: true }
        );


        console.log("Category updated successfully:", category);

        return NextResponse.json(category, { status: 200 });
      } catch (uploadError) {
        console.error("Error uploading file:", uploadError);
        return NextResponse.json(
          { message: "Failed to upload image" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error in category update:", error);
      return NextResponse.json(
        { message: error.message || "Error updating category" },
        { status: 500 }
      );
    }
  },
  async delete(req) {
    try {
      console.log("Starting category deletion...");

      const formData = await req.formData();
      console.log("FormData received:", Object.fromEntries(formData));

      const name = formData.get("name");

      // Validate inputs
      if (!name) {
        console.log("Missing required fields:", { name });
        return NextResponse.json(
          { message: "Please provide all required fields" },
          { status: 400 }
        );
      }
      const userid = req.userId;
      const user = await User.findOne({ _id: userid })
      const restaurant = user.restaurantId;
      // Check for existing category
      const existingCategory = await Category.findOne({ name, restaurant });
      if (!existingCategory) {
        console.log("Category does not exist:", name);
        return NextResponse.json(
          { message: "Category does not exist" },
          { status: 404 }
        );
      }

      // Delete category from database
      await Category.deleteOne({ name });

      console.log("Category deleted successfully:", name);

      return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error in category deletion:", error);
      return NextResponse.json(
        { message: error.message || "Error deleting category" },
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

export async function PUT(req) {
  try {
    console.log("PUT request received");
    return await categoryController.update(req);
  } catch (error) {
    console.error("Error in PUT handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    console.log("DELETE request received");
    return await categoryController.delete(req);
  } catch (error) {
    console.error("Error in DELETE handler:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}