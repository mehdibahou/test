// components/ProductParams.js
"use client";
import React, { useState } from 'react';
import useProductStore from '@/app/store/productstore'; // Adjust the path as necessary

const ProductParams = () => {
  const { products, setProducts } = useProductStore((state) => ({
    products: state.products,
    setProducts: state.setProducts,
  }));

 const {color,setColor}=useProductStore(); 
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      { id: Date.now(), name: '', href: '', price: '', imageSrc: '', imageAlt: '' },
    ]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 flex flex-col space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Products</h3>
      
      <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">Background color</label>
      <input type="color" class="p-1 h-8 w-14 block bg-white border border-gray-400 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700" id="hs-color-input" value={color} title="Choose your color" onChange={(e)=>setColor(e.target.value)}></input>

      {products.map((product, index) => (
        <div key={index} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={product.name}
            onChange={(e) => handleProductChange(index, 'name', e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm p-2"
          />
          <input
            type="text"
            placeholder="Href"
            value={product.href}
            onChange={(e) => handleProductChange(index, 'href', e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm p-2"
          />
          <input
            type="text"
            placeholder="Price"
            value={product.price}
            onChange={(e) => handleProductChange(index, 'price', e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm p-2"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={product.imageSrc}
            onChange={(e) => handleProductChange(index, 'imageSrc', e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm p-2"
          />
          <input
            type="text"
            placeholder="Image Alt"
            value={product.imageAlt}
            onChange={(e) => handleProductChange(index, 'imageAlt', e.target.value)}
            className="border border-gray-300 rounded-md shadow-sm p-2"
          />
          <button
            type="button"
            onClick={() => removeProduct(index)}
            className="text-red-500"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addProduct}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Add Product
      </button>
    </div>
  );
};

export default ProductParams;
