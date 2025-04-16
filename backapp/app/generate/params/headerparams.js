// HeaderParams.js
"use client";
import React from 'react';
import useStore from '@/app/store/store';
import SizeModifier from '../smcomponent/sizeadj';
import ImageSelector from '../smcomponent/imgselector';
const HeaderParams = () => {
  const { color,setColor,logoUrl, loginHref, navItems, setLogoUrl, setLoginHref, updateNavItem, addNavItem, removeNavItem } = useStore();

  return (
    <div className="p-6 flex flex-col space-y-6">
              <h3 className="text-lg  text-gray-900 font-bold">Logo</h3>

      <div className="flex flex-col space-y-2">
        <label htmlFor="logoUrl" className="text-sm font-medium text-gray-700 ">Logo url:</label>
        <input
          type="text"
          id="logoUrl"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className=" h-8 border  border-gray-600 font-normal text-sm text-gray-900 rounded-md shadow-sm p-2"
        />
      </div>
      <SizeModifier />

      <ImageSelector />
              <h3 className="text-lg  text-gray-900 font-bold">Header params</h3>

      <label for="hs-color-input" class="block text-sm font-medium text-gray-700 mb-2 dark:text-white">Header color</label>
<input type="color" class="p-1 h-8 w-14 block bg-white border border-gray-400 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700" id="hs-color-input" value={color} title="Choose your color" onChange={(e)=>setColor(e.target.value)}></input>


<label for="hs-color-input" class="block text-sm font-medium text-gray-700 mb-2 dark:text-white">Button color</label>
<input type="color" class="p-1 h-8 w-14 block bg-white border border-gray-400 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700" id="hs-color-input" value="#2563eb" title="Choose your color"></input>


      <div className="flex flex-col space-y-2">
        <label htmlFor="loginHref" className="text-sm font-medium text-gray-700 ">Button link:</label>
        <input
          type="text"
          id="loginHref"
          value={loginHref}
          onChange={(e) => setLoginHref(e.target.value)}
          className="h-8 border border-gray-600 font-normal text-sm text-gray-900 rounded-md shadow-sm p-2"
        />
      </div>
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg  text-gray-900 font-bold">Navigation Links</h3>
        <div className="flex flex-col space-y-4">
          {navItems.map((item, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <input
                type="text"
                placeholder="Name"
                value={item.name}
                onChange={(e) => updateNavItem(index, 'name', e.target.value)}
                className="h-8 border border-gray-600 font-normal text-sm text-gray-900 rounded-md shadow-sm p-2"
              />
              <input
                type="text"
                placeholder="Href"
                value={item.href}
                onChange={(e) => updateNavItem(index, 'href', e.target.value)}
                className="h-8 border border-gray-600 font-normal text-sm text-gray-900 rounded-md shadow-sm p-2"
              />
              <button
                type="button"
                onClick={() => removeNavItem(index)}
                className="text-red-500 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className='w-full flex justify-center'>
          <button
            type="button"
            onClick={addNavItem}
            className="bg-gray-50 border border-black h-8 w-48 text-xs font-bold text-black px-4 py-2 rounded-2xl flex justify-center items-center"
          >
            Add Navigation Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderParams;
