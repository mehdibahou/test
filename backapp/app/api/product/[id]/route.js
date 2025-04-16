// app/api/product/[id]/route.js
import { NextResponse } from "next/server";
import FoodProduct from "@/models/product";
import { put } from "@vercel/blob";
import { StatusCodes } from "http-status-codes";

// Helper function to convert to number or null
const toNumber = (value) => {
  if (value === null || value === "" || value === "null" || value === undefined) {
    return null;
  }
  const num = Number(value);
  return isNaN(num) ? null : num;
};

// Helper function to handle file upload
const handleFileUpload = async (file) => {
  if (!file || file === "null" || typeof file === "string") {
    return null;
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Math.random().toString(36).substring(7)}-${file.name}`;

    const uploadedFile = await put(fileName, buffer, {
      access: 'public',
      contentType: file.type
    });

    return uploadedFile.url;
  } catch (error) {
    console.error("File upload error:", error);
    throw new Error("File upload failed");
  }
};

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const formData = await request.formData();

    // Get existing product
    const existingProduct = await FoodProduct.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Prepare update data with proper type conversion
    const updateData = {
      name: formData.get("name") || undefined,
      description: formData.get("description") || undefined,
      price: toNumber(formData.get("price")),
      glovoprice: toNumber(formData.get("glovoprice")),
      off: toNumber(formData.get("off")),
      store: formData.get("store") || undefined,
      category: formData.get("category") || undefined,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    // Handle image update
    const newImage = formData.get("image");
    if (newImage && newImage !== "null") {
      const imageUrl = await handleFileUpload(newImage);
      if (imageUrl) {
        updateData.image = imageUrl;
      }
    }

    // Process variants
    const variants = [];
    let index = 0;
    while (formData.get(`variants[${index}][variantName]`)) {
      const variantName = formData.get(`variants[${index}][variantName]`);
      const variantPrice = toNumber(formData.get(`variants[${index}][price]`));
      
      if (variantName && variantPrice !== null) {
        variants.push({ variantName, price: variantPrice });
      }
      index++;
    }

    if (variants.length > 0) {
      updateData.variants = variants;
    }

    // Update product with validation
    const updatedProduct = await FoodProduct.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        omitUndefined: true 
      }
    );

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct
    }, { status: StatusCodes.OK });

  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { 
        error: "Failed to update product", 
        details: error.message 
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const product = await FoodProduct.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(product, { status: StatusCodes.OK });
  } catch (error) {
    console.error("Error retrieving product:", error);
    return NextResponse.json(
      { error: "Failed to retrieve product" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}