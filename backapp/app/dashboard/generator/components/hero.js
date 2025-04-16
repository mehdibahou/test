// components/Hero.js
import React from 'react';

const Hero = ({ image, title, description }) => {
  return (
    <section className="relative h-64 bg-gray-300">
      <img src={image} alt={title} className="absolute w-full h-full object-cover opacity-50" />
      <div className="relative z-10 p-4">
        <h2 className="text-4xl">{title}</h2>
        <p className="text-2xl">{description}</p>
      </div>
    </section>
  );
};

export default Hero;
