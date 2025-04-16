// components/HeroParams.js
"use client";
import React, { useState } from 'react';
import HerouseStore from '@/app/store/herostore'; // Adjust the path as necessary
import ImageSelector from '../smcomponent/imgselector';


const HeroParams = () => {
  const { hero, setHero } = HerouseStore((state) => ({
    hero: state.hero,
    setHero: state.setHero,
  }));

  const handleLogoUrlChange = (e) => {
    setHero({ logoUrl: e.target.value });
  };

  const handleHeadlineChange = (e) => {
    setHero({ headline: e.target.value });
  };

  const handleSubheadlineChange = (e) => {
    setHero({ subheadline: e.target.value });
  };

  const handleCta1TextChange = (e) => {
    setHero({ cta1: { ...hero.cta1, text: e.target.value } });
  };

  const handleCta1HrefChange = (e) => {
    setHero({ cta1: { ...hero.cta1, href: e.target.value } });
  };

  const handleCta2TextChange = (e) => {
    setHero({ cta2: { ...hero.cta2, text: e.target.value } });
  };

  const handleCta2HrefChange = (e) => {
    setHero({ cta2: { ...hero.cta2, href: e.target.value } });
  };

  const handleImageUrlChange = (e) => {
    setHero({ imageUrl: e.target.value });
  };

  const {color,setColor}=HerouseStore();


  return (
    
    <div className="p-6 flex flex-col space-y-6">
          <h3 className="text-lg  text-gray-900 font-bold">Text</h3>

      <div className="flex flex-col space-y-2">
        <label htmlFor="headline" className="text-sm font-medium text-gray-700">Headline:</label>
        <input
          type="text"
          id="headline"
          value={hero.headline}
          onChange={handleHeadlineChange}
          className="h-8 border  border-gray-600 font-normal text-sm text-gray-900 rounded-md shadow-sm p-2"
        />
      </div>
      <div className="flex flex-col space-y-2">
        <label htmlFor="subheadline" className="text-sm font-medium text-gray-700">Subheadline:</label>
        {/* <input
          type="text"
          id="subheadline"
          
          className="h-8 border  border-gray-600 font-normal text-sm text-gray-900 rounded-md shadow-sm p-2 "
        /> */}

<div class="max-w-sm space-y-3">
  <textarea class="py-3 px-4 block w-full border  border-gray-600 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" rows="3"  value={hero.subheadline}
          onChange={handleSubheadlineChange}></textarea>
</div>

<label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">Background color</label>
<input type="color" class="p-1 h-8 w-14 block bg-white border border-gray-400 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700" id="hs-color-input" value={color} title="Choose your color" onChange={(e)=>setColor(e.target.value)}></input>
      </div>
     
      <div className="flex flex-col space-y-4">
      <h3 className="text-lg  text-gray-900 font-bold">Image</h3>
      <div className="flex flex-col space-y-2">
          <label htmlFor="cta1Text" className="text-sm font-medium text-gray-700">Image:</label>
         <ImageSelector />
         
         <div className="flex flex-col space-y-2">
        <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700 ">image url:</label>
        <input
          type="text"
          id="imageUrl"
          value={hero.imageUrl}
          onChange={handleImageUrlChange}
          className=" h-8 border  border-gray-600 font-normal text-sm text-gray-900 rounded-md shadow-sm p-2"
        />
      </div>

          <label htmlFor="cta1Href" className="text-sm font-medium text-gray-700">Href:</label>
          <input
            type="text"
            id="cta1Href"
            value={hero.cta1.href}
            onChange={handleCta1HrefChange}
            className="h-8 border  border-gray-600 font-normal text-sm text-gray-900 rounded-md shadow-sm p-2"
          />
        </div>
        <h3 className="text-lg  text-gray-900 font-bold">Buttons</h3>
        <div className="flex flex-col space-y-2">
          <label htmlFor="cta2Text" className="text-sm font-medium text-gray-700">Text:</label>
          <input
            type="text"
            id="cta2Text"
            value={hero.cta2.text}
            onChange={handleCta2TextChange}
            className="h-8 border  border-gray-600 font-normal text-sm text-gray-900 rounded-md shadow-sm p-2"
          />
          <label htmlFor="cta2Href" className="text-sm font-medium text-gray-700">Href:</label>
          <input
            type="text"
            id="cta2Href"
            value={hero.cta2.href}
            onChange={handleCta2HrefChange}
            className="h-8 border  border-gray-600 font-normal text-sm text-gray-900 rounded-md shadow-sm p-2"
          />
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">Color</label>
<input type="color" class="p-1 h-8 w-14 block bg-white border border-gray-400 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700" id="hs-color-input" value="#2563eb" title="Choose your color"></input>

      </div>
      
      
    </div>
  );
};

export default HeroParams;
