// components/Menu.js
import React from 'react';

const Menu = ({ items }) => {
  return (
    <section className="p-4">
      <h2 className="text-2xl mb-4">Menu</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index} className="border-b py-2">
            <h3 className="text-xl">{item.name}</h3>
            <p>{item.description}</p>
            <p className="text-right">${item.price}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Menu;
