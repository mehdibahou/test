// product.js
"use client";
import { useState } from "react";
import AddMenuItemForm from "./foodform";
import ProductTable from "./products";
import EditProductForm from "./edit";

export default function Product() {
  const [page, setPage] = useState("productTable");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setPage("editProduct");
  };

  const handleEditSuccess = () => {
    setPage("productTable");
    setSelectedProduct(null);
  };

  return (
    <>
      {page === "productTable" ? (
        <ProductTable setPage={setPage} onEdit={handleEdit} />
      ) : page === "editProduct" ? (
        <EditProductForm 
          productId={selectedProduct._id} 
          onSuccess={handleEditSuccess}
          onCancel={() => setPage("productTable")}
        />
      ) : (
        <AddMenuItemForm onSuccess={() => setPage("productTable")} />
      )}
    </>
  );
}