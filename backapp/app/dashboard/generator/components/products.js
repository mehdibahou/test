// components/Products.js
import React from 'react';

const Products = ({ items }) => {
  return (
    <section className="p-4">
      <h2 className="text-2xl mb-4">Our Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div key={index} className="border p-4 rounded">
            <img src={item.image} alt={item.name} className="w-full h-32 object-cover mb-2" />
            <h3 className="text-xl">{item.name}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Products;
