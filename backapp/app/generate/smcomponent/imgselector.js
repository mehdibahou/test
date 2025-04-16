import React from 'react';

const ImageSelector = () => {
  return (
    <div className="p-4 border border-dashed border-gray-300 rounded-md text-center">
      <p className="text-sm font-medium text-gray-900 mb-2">Première image</p>
      <div className="space-y-2">
        <button className="w-full bg-gray-100 py-2 rounded-md text-gray-700 font-semibold">
          Sélectionner une image
        </button>
        <a href="#" className="text-blue-600 hover:underline">
          Parcourir les images gratuites
        </a>
      </div>
    </div>
  );
};

export default ImageSelector;
