import React from 'react';
import useFooterStore from '@/app/store/footerstore';
const FooterParams = () => {
    const params = {
        companyName: 'My Company',
        year: new Date().getFullYear(),
    };
    const {color,setColor}=useFooterStore();

    return (
     <div>
     <label for="hs-color-input" class="block text-sm font-medium text-gray-700 mb-2 dark:text-white">Footer color</label>
<input type="color" class="p-1 h-8 w-14 block bg-white border border-gray-400 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700" id="hs-color-input" value={color} title="Choose your color" onChange={(e)=>setColor(e.target.value)}></input>
    </div>

    );
};

export default FooterParams;