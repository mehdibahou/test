"use client";
import { useState } from 'react';
import HeaderParams from './params/headerparams';
import FooterParams from './params/footerparams';
import ProductParams from './params/productparams';
import HeroParams from './params/heroparams';
import Pagebutton from './smcomponent/button';
import { HiOutlineComputerDesktop } from "react-icons/hi2";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { SlSizeFullscreen } from "react-icons/sl";
import { RiLogoutBoxLine } from "react-icons/ri";
import { BsThreeDots } from "react-icons/bs";
import { FaCircle } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa";
import useViewStore from '../store/viewstore';
import { IoMdArrowRoundBack } from "react-icons/io";
import Link from 'next/link';
import useFooterStore from "../store/footerstore";
import HerouseStore from "../store/herostore";
import useStore from "../store/store";
import useProductStore from "../store/productstore";

export const getStateWithoutFunctions = (store) => {
  const state = store.getState();
  return Object.fromEntries(
    Object.entries(state).filter(([key, value]) => typeof value !== 'function')
  );
};

 const  saveWebsiteStates = async () => {
  const header = getStateWithoutFunctions(useStore);
  const hero = getStateWithoutFunctions(HerouseStore);
  const footer = getStateWithoutFunctions(useFooterStore);
  const product = getStateWithoutFunctions(useProductStore);

//   console.log(hero)
// console.log(header)
// console.log(footer)
// console.log(product)

  try {
    const response = await fetch('/api/website', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ header, hero, footer, product }),
    });

    if (response.ok) {
      console.log('Website states saved successfully!');
    } else {
      console.error('Failed to save website states');
    }
  } catch (error) {
    console.error('Error saving website states:', error);
  }
};




const components = [
  { name: "Header", href: "#header" },
  { name: "Hero", href: "#hero" },
  { name: "Menu", href: "#menu" },
  { name: "Footer", href: "#footer" },
];

export default function Example({ children }) {
  const [sidebarContent, setSidebarContent] = useState(null);
  
  

  
  const { view, setView } = useViewStore((state) => ({
    view: state.view,
    setView: state.setView,
  }));



  const handleItemClick = (name) => {
    console.log(`Clicked on ${name}`);
    setSidebarContent(name); // Simplify by directly setting the name
  };

  const componentMap = {
    "Header": HeaderParams,
    "Hero": HeroParams,
    "Menu": ProductParams,
    "Footer": FooterParams,
  };
  
  const renderComponent = () => {
    const Component = componentMap[sidebarContent];
    return Component ? 
    <div>
      <button className='pl-3 ' onClick={() => setSidebarContent(null)}><IoMdArrowRoundBack width={20} height={20}/>
      </button>
      <Component />
      </div> : null;
  };

  return (
    <>
      <div className=''></div>
      <div className=''>
        <header className='w-full h-12 shadow-md shadow-gray-500 fixed bg-white z-40 flex justify-between items-center px-12 '>
          <div className='flex justify-between gap-3 items-center'>
           <RiLogoutBoxLine/>
            <p className='font-semibold text-gray-700 text-sm'>Hydra</p>
            <div className='w-24 h-6 bg-[#b3fcd1] text-[#0a502c] font-semibold rounded-xl text-xs flex justify-center items-center gap-2'>En direct <span><FaCircle/></span></div>
            <BsThreeDots/>
          </div>
          <div className='flex justify-between gap-4'>
            <Pagebutton/>

            

          </div>
          <div className='flex justify-between gap-3'>
           
            <div className='w-6 h-6 bg-gray-200 flex rounded-md justify-center items-center ' onClick={()=>{setView("desktop")}}>     <HiOutlineComputerDesktop/>   </div>
            <div className='w-6 h-6 bg-gray-200 flex rounded-md justify-center items-center' onClick={()=>{setView("mobile")}}>        <IoPhonePortraitOutline/>  </div>
           <Link href="/your-website"> <div className='w-6 h-6 bg-gray-200 flex rounded-md justify-center items-center ' >               <SlSizeFullscreen/>  </div></Link>
            <div className='cursor-pointer w-24 flex justify-center items-center h-6 bg-black rounded-md text-white font-medium font-sans text-sm' onClick={saveWebsiteStates}> enregistrer</div>

            
           
          </div>

        </header>
        <div className='flex justify-start items-start h-screen'>
          <div className='w-1/4 h-screen fixed top-0 bottom-0 z-30 bg-white  flex flex-col justify-start pt-20 overflow-y-auto '>
            {!sidebarContent ? (
              <ul>
                             <h3 className="text-lg  text-gray-900 font-bold px-3 mb-4 w-full">Home page</h3>

                {components.map((component) => (
                  <li key={component.name} onClick={() => handleItemClick(component.name)} className='flex justify-between items-center '>
                    <a href={component.href} className="flex w-full justify-between items-center  px-3 py-2 text-sm font-normal text-gray-800 hover:bg-slate-100 ">
                      {component.name}
                      <FaAngleRight/>
                    </a>
                    
                  </li>
                ))}
              </ul>
            ) : (
              
              renderComponent()
            )}
          </div>
          <div className="w-screen h-screen  ">
            <div className="pl-3 pt-12  bg-slate-300 ml-[25%] ">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
