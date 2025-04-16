"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, X } from "lucide-react";
import CategorySelector from "./categoryselect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function EditProductForm({ productId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [product, setProduct] = useState({
    name: "",
    description: "",
    image: null,
    price: "",
    glovoprice: "",
    off: "",
    store: "",
    category: "",
    variants: [{ variantName: "", price: "" }],
  });

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/product/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setSelectedCategory(data.category);
        } else {
          console.error("Failed to fetch product");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    setProduct(prev => ({ ...prev, category: selectedCategory }));
  }, [selectedCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProduct(prev => ({
      ...prev,
      image: file,
    }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVariants = [...product.variants];
    updatedVariants[index][name] = value;
    setProduct(prev => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  const handleAddVariant = () => {
    setProduct(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { variantName: "", price: "" },
      ],
    }));
  };

  const handleRemoveVariant = (index) => {
    setProduct(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(product).forEach(([key, value]) => {
        if (key === "variants") {
          // Handle variants separately to maintain array structure
          value.forEach((variant, index) => {
            formData.append(`variants[${index}][variantName]`, variant.variantName);
            formData.append(`variants[${index}][price]`, variant.price);
          });
        } else if (key === "image" && value instanceof File) {
          formData.append(key, value);
        } else if (key !== "_id" && key !== "__v") {
          // Exclude MongoDB specific fields
          formData.append(key, String(value));
        }
      });

      const response = await fetch(`/api/product/${productId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        console.error("Updating product failed", errorData);
        alert("Failed to update product");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={product.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="glovoprice">Glovo Price</Label>
              <Input
                id="glovoprice"
                name="glovoprice"
                type="number"
                value={product.glovoprice}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={product.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="off">Discount (%)</Label>
              <Input
                id="off"
                name="off"
                type="number"
                value={product.off}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store">Store ID</Label>
              <Input
                id="store"
                name="store"
                value={product.store}
                onChange={handleChange}
                
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <CategorySelector
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Update Image</Label>
            <Input
              id="image"
              name="image"
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Variants</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariant}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Variant
              </Button>
            </div>
            {product.variants.map((variant, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Input
                  name="variantName"
                  value={variant.variantName}
                  onChange={(e) => handleVariantChange(index, e)}
                  placeholder="Variant name"
                />
                <Input
                  name="price"
                  type="number"
                  value={variant.price}
                  onChange={(e) => handleVariantChange(index, e)}
                  placeholder="Variant price"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveVariant(index)}
                  disabled={product.variants.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Product
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}