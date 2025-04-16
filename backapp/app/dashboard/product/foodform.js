"use client";

import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import CategorySelector from "./categoryselect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function AddMenuItemForm() {
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    image: null,
    price: "",
    glovoprice: "",
    off: "",
    category: "",
    variants: [{ variantName: "", price: "" }],
  });

  useEffect(() => {
    setMounted(true);
    // Update category when selectedCategory changes
    setNewItem((prev) => ({ ...prev, category: selectedCategory }));
  }, [selectedCategory]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewItem((prevItem) => ({
      ...prevItem,
      image: file,
    }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVariants = [...newItem.variants];
    updatedVariants[index][name] = value;
    setNewItem((prevItem) => ({
      ...prevItem,
      variants: updatedVariants,
    }));
  };

  const handleAddVariant = () => {
    setNewItem((prevItem) => ({
      ...prevItem,
      variants: [
        ...prevItem.variants,
        { variantName: "", price: "", glovoprice: "" },
      ],
    }));
  };

  const handleRemoveVariant = (index) => {
    setNewItem((prevItem) => ({
      ...prevItem,
      variants: prevItem.variants.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(newItem).forEach(([key, value]) => {
        if (key === "variants") {
          formData.append(key, JSON.stringify(value));
        } else if (key === "image" && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      });
      console.log(formData, "hghjklkjhg");
      const response = await fetch("/api/product", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMenu((prevMenu) => [...prevMenu, newItem]);
        setNewItem({
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
      } else {
        const errorData = await response.json();
        console.error("Adding product failed", errorData);
        alert("Adding product failed");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Add New Food Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newItem.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={newItem.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Glovo Price</Label>
                <Input
                  id="glovoprice"
                  name="glovoprice"
                  type="number"
                  value={newItem.glovoprice}
                  onChange={handleChange}
                  placeholder="Enter glovo price"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={newItem.description}
                onChange={handleChange}
                placeholder="Enter product description"
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
                  value={newItem.off}
                  onChange={handleChange}
                  placeholder="Enter discount"
                />
              </div>
            
              <div className="space-y-2"></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <CategorySelector
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
              />
              <Label htmlFor="image">Image</Label>
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
              {newItem.variants.map((variant, index) => (
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
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Item
            </Button>
          </form>
        </CardContent>
      </Card>

      {menu.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Name</th>
                    <th className="text-left p-2 font-semibold">Description</th>
                    <th className="text-left p-2 font-semibold">Price</th>
                    <th className="text-left p-2 font-semibold">Discount</th>
                    <th className="text-left p-2 font-semibold">Store</th>
                    <th className="text-left p-2 font-semibold">Category</th>
                    <th className="text-left p-2 font-semibold">Variants</th>
                  </tr>
                </thead>
                <tbody>
                  {menu.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2">{item.price}</td>
                      <td className="p-2">{item.off}%</td>
                      <td className="p-2">{item.store}</td>
                      <td className="p-2">{item.category}</td>
                      <td className="p-2">
                        {item.variants.map((variant, variantIndex) => (
                          <div key={variantIndex}>
                            {variant.variantName}: {variant.price}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
