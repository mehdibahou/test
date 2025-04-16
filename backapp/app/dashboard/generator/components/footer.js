// components/Footer.js
import React from 'react';

const Footer = ({ text }) => {
  return (
    <footer className="p-4 bg-gray-800 text-white text-center">
      {text}
    </footer>
  );
};

export default Footer;
