// components/SizeModifier.js
"use client";
import { useState } from 'react';

export default function SizeModifier() {
  const [logosize, setlogosize] = useState(20);
  const [marginBottom, setMarginBottom] = useState(20);
  const [sectionMarginBottom, setSectionMarginBottom] = useState(8);

  const handlelogosizeChange = (e) => {
    setlogosize(Number(e.target.value));
  };

  const handleMarginBottomChange = (e) => {
    setMarginBottom(Number(e.target.value));
  };

  const handleSectionMarginBottomChange = (e) => {
    setSectionMarginBottom(Number(e.target.value));
  };

  return (
    <div className="p-1 flex flex-col w-full justify-start">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-800">Logo size</label>
        <input
          type="range"
          min="0"
          max="100"
          value={logosize}
          onChange={handlelogosizeChange}
          className="w-full bg-black"
        />
        <div className="flex items-center">
          <input
            type="number"
            value={logosize}
            onChange={handlelogosizeChange}
            className="border border-gray-300 rounded-md shadow-sm p-2 w-20"
          />
          <span className="ml-2">px</span>
        </div>
      </div>

     
    </div>
  );
}
