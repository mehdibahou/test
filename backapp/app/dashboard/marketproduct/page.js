"use client";
import { useState } from "react";
import AddMenuItemForm from "./foodform";
import ProductTable from "./products";

export default function Dashboard() {
  const [page, setPage] = useState("productTable");

  return (
    <>
      {page === "productTable" ? (
        <ProductTable setPage={setPage} />
      ) : (
        <AddMenuItemForm />
      )}
    </>
  );
}
