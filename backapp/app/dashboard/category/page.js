"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function CategoryForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [categories, setCategories] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    imagePreview: "",
  });

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/category");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setFetchError(err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.target);

      const response = await fetch("/api/category", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      await fetchCategories();
      e.target.reset();
      setPreview("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditForm(prev => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setEditForm({
      name: category.name,
      description: category.description,
      imagePreview: category.image,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      description: "",
      imagePreview: "",
    });
  };

  const handleEditSubmit = async (categoryId) => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      
      // Get the file input
      const fileInput = document.getElementById(`edit-image-${categoryId}`);
      if (fileInput && fileInput.files[0]) {
        formData.append("image", fileInput.files[0]);
      }

      const response = await fetch(`/api/category`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      await fetchCategories();
      setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Card className="mx-auto">
        <CardHeader>
          <CardTitle>Create Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="space-y-2">
              <Input placeholder="Category Name" name="name" required />
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Description"
                name="description"
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image").click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
                {preview && (
                  <div className="relative w-16 h-16">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Category"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="px-2 mt-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Categories
            </h1>
          </div>
        </div>
        {fetchError && (
          <p className="text-sm text-red-500 mt-2">{fetchError}</p>
        )}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        ID
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Image
                      </th>
                      <th
                        scope="col"
                        className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                      >
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {categories.map((category) => (
                      <tr key={category._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {category._id
                            .toString()
                            .substring(0, 3)
                            .toUpperCase()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {editingId === category._id ? (
                            <Input
                              name="name"
                              value={editForm.name}
                              onChange={handleEditInputChange}
                              required
                            />
                          ) : (
                            category.name
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {editingId === category._id ? (
                            <Input
                              name="description"
                              value={editForm.description}
                              onChange={handleEditInputChange}
                              required
                            />
                          ) : (
                            category.description
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {editingId === category._id ? (
                            <div className="flex items-center space-x-4">
                              <Input
                                id={`edit-image-${category._id}`}
                                name="image"
                                type="file"
                                accept="image/*"
                                onChange={handleEditImageChange}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById(`edit-image-${category._id}`).click()}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Change Image
                              </Button>
                              <div className="relative w-16 h-16">
                                <img
                                  src={editForm.imagePreview || category.image}
                                  alt="Preview"
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="h-10 w-10 object-cover rounded"
                            />
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          {editingId === category._id ? (
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                onClick={cancelEdit}
                                className="px-2 py-1 text-sm"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleEditSubmit(category._id)}
                                className="px-2 py-1 text-sm"
                                disabled={loading}
                              >
                                {loading ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => startEdit(category)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}