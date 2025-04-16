// components/Generator.js
import React, { useState } from 'react';
import Header from './components/header'; 
import Hero from './components/hero';
import Products from './components/products';
import Menu from './components/menu';
import Footer from './components/footer';

const Generator = () => {
  const [header, setHeader] = useState({
    title: 'Welcome to Our Restaurant',
    subtitle: 'The best place to enjoy your meals',
    backgroundColor: 'bg-blue-500'
  });

  const [hero, setHero] = useState({
    image: '/default-hero.jpg',
    title: 'Delicious Food Awaits',
    description: 'Experience the taste of our exquisite dishes'
  });

  const [products, setProducts] = useState([
    { name: 'Product 1', description: 'Delicious and fresh', image: '/default-product.jpg' },
    { name: 'Product 2', description: 'Tasty and healthy', image: '/default-product.jpg' }
  ]);

  const [menu, setMenu] = useState([
    { name: 'Dish 1', description: 'A tasty dish', price: 12.99 },
    { name: 'Dish 2', description: 'A delicious dish', price: 15.99 }
  ]);

  const [footer, setFooter] = useState('© 2024 Our Restaurant. All rights reserved.');

  const [preview, setPreview] = useState(false);

  const handleGenerate = () => {
    setPreview(true);
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl mb-4">Generate Your Restaurant Website</h2>

      {/* Header Inputs */}
      <div className="mb-4">
        <h3 className="text-xl mb-2">Header</h3>
        <label className="block mb-2">Title</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          value={header.title}
          onChange={(e) => setHeader({ ...header, title: e.target.value })}
        />
        <label className="block mb-2">Subtitle</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          value={header.subtitle}
          onChange={(e) => setHeader({ ...header, subtitle: e.target.value })}
        />
        <label className="block mb-2">Background Color</label>
        <select
          className="w-full p-2 border border-gray-300 rounded"
          value={header.backgroundColor}
          onChange={(e) => setHeader({ ...header, backgroundColor: e.target.value })}
        >
          <option value="bg-blue-500">Blue</option>
          <option value="bg-red-500">Red</option>
          <option value="bg-green-500">Green</option>
        </select>
      </div>

      {/* Hero Inputs */}
      <div className="mb-4">
        <h3 className="text-xl mb-2">Hero</h3>
        <label className="block mb-2">Image URL</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          value={hero.image}
          onChange={(e) => setHero({ ...hero, image: e.target.value })}
        />
        <label className="block mb-2">Title</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          value={hero.title}
          onChange={(e) => setHero({ ...hero, title: e.target.value })}
        />
        <label className="block mb-2">Description</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          value={hero.description}
          onChange={(e) => setHero({ ...hero, description: e.target.value })}
        />
      </div>

      {/* Products Inputs */}
      <div className="mb-4">
        <h3 className="text-xl mb-2">Products</h3>
        {products.map((product, index) => (
          <div key={index} className="mb-2">
            <label className="block mb-2">Product {index + 1} Name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-2"
              value={product.name}
              onChange={(e) => {
                const newProducts = [...products];
                newProducts[index].name = e.target.value;
                setProducts(newProducts);
              }}
            />
            <label className="block mb-2">Product {index + 1} Description</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-2"
              value={product.description}
              onChange={(e) => {
                const newProducts = [...products];
                newProducts[index].description = e.target.value;
                setProducts(newProducts);
              }}
            />
            <label className="block mb-2">Product {index + 1} Image URL</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={product.image}
              onChange={(e) => {
                const newProducts = [...products];
                newProducts[index].image = e.target.value;
                setProducts(newProducts);
              }}
            />
          </div>
        ))}
      </div>

      {/* Menu Inputs */}
      <div className="mb-4">
        <h3 className="text-xl mb-2">Menu</h3>
        {menu.map((menuItem, index) => (
          <div key={index} className="mb-2">
            <label className="block mb-2">Dish {index + 1} Name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-2"
              value={menuItem.name}
              onChange={(e) => {
                const newMenu = [...menu];
                newMenu[index].name = e.target.value;
                setMenu(newMenu);
              }}
            />
            <label className="block mb-2">Dish {index + 1} Description</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-2"
              value={menuItem.description}
              onChange={(e) => {
                const newMenu = [...menu];
                newMenu[index].description = e.target.value;
                setMenu(newMenu);
              }}
            />
            <label className="block mb-2">Dish {index + 1} Price</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded"
              value={menuItem.price}
              onChange={(e) => {
                const newMenu = [...menu];
                newMenu[index].price = e.target.value;
                setMenu(newMenu);
              }}
            />
          </div>
        ))}
      </div>

      {/* Footer Inputs */}
      <div className="mb-4">
        <h3 className="text-xl mb-2">Footer</h3>
        <label className="block mb-2">Footer Text</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
        />
      </div>

      <button
        className="bg-green-500 text-white py-2 px-4 rounded"
        onClick={handleGenerate}
      >
        Generate Website
      </button>

      {preview && (
        <div className="mt-8">
          <h3 className="text-xl mb-4">Preview</h3>
          <div>
            <Header {...header} />
            <Hero {...hero} />
            <Products items={products} />
            <Menu items={menu} />
            <Footer text={footer} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Generator;
