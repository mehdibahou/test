// components/Header.js
import React from 'react';

const Header = ({ title, subtitle, backgroundColor }) => {
  return (
    <header className={`p-4 ${backgroundColor}`}>
      <h1 className="text-3xl">{title}</h1>
      <p className="text-xl">{subtitle}</p>
    </header>
  );
};

export default Header;
