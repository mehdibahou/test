"use client";

import { useEffect, useState } from "react";
import useViewStore from '@/app/store/viewstore';

export default function ProductsExample() {
  const { view } = useViewStore(state => ({
    view: state.view,
  }));

  const [products, setProducts] = useState([]);
  const [color, setColor] = useState("#ffffff"); // default color if needed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/caisse'); // replace with your actual API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
        setColor(data.color || "#ffffff"); // set color from response, if applicable
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white" style={{ backgroundColor: "#ffffff" }}>
        <div className={`mx-auto ${view === 'mobile' ? 'max-w-md px-4 py-8' : 'max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'}`}>
          <h2 className="sr-only">Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="group animate-pulse">
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200">
                  <div className="h-full w-full bg-gray-300"></div>
                </div>
                <div className="mt-2 text-base bg-gray-300 rounded h-4"></div>
                <div className="mt-1 text-lg bg-gray-300 rounded h-6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="bg-white" style={{ backgroundColor: color }}>
      <div className={`mx-auto ${view === 'mobile' ? 'max-w-md px-4 py-8' : 'max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8'}`}>
        <h2 className="sr-only">Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
          {products.map((product) => (
            <a key={product.id} href={product.href} className="group">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200">
                <img
                  src={product.image}
                  alt={product.imageAlt}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
              </div>
              <h3 className="mt-2 text-base text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{product.price}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}  
