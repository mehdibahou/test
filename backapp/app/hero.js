'use client'
import Image from "next/image";
import Head from 'next/head';
import { Main } from "next/document";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import Header from "./header";
import Headertwo from "./with_call_to_action";

export default function Hero() {
    return(
        <div className="lg:h-screen  sm:h-auto   flex flex-col justify-start items-center   ">
        <Headertwo/>
 
        <div className="sm:flex sm:flex-col sm:justify-start sm:items-center sm:p-10 lg:p-0 w-full h-[90%] lg:flex lg:flex-row lg:justify-start ">
         <div className="lg:w-[60%] w-[100%]  lg:flex  lg:justify-center lg:items-start sm:flex sm:flex-col sm:justify-center sm:items-center gap-8 pt-24 px-8">
            <h1 className=" font-bold text-5xl text-[#0a1b43]">
            Everything your restaurant needs to sell online
            </h1>
            <p className="">
            Montez votre boutique en ligne en quelques clics et beneficiez de tous les outils essentiels pour reussir dans l'e-commerce
            </p>
             <div className="flex flex-col gap-4">
            <div className="flex justify-start items-center gap-x-1 p-0 ">
            <IoIosCheckmarkCircleOutline color="green" />
           <p>Configuration facile et intuitive de votre site</p>
            </div>
 
            <div className="flex justify-start items-center gap-x-1 p-0 ">
            <IoIosCheckmarkCircleOutline color="green" />
           <p>Pas de ventes, pas de frais</p>
            </div>
 
 
            <div className="flex justify-start items-center gap-x-1 p-0 ">
            <IoIosCheckmarkCircleOutline color="green" />
           <p>Tous les outils e-commerce dont vous avez besoin dans un seul endroit</p>
            </div>
            </div>
 
            
 
 
            
            <button className="w-52 h-9 bg-[#0c725c] text-white rounded-md font-semibold">Start now</button>
         </div>
         <div className="w-[40%] bg-white flex justify-center items-center pt-28 pr-4 ">
         <Image
         src="/image.webp" // Path to your image
         alt="Description of the image"
         width={500} // Desired width of the image
         height={300} // Desired height of the image
      
      />
        
         </div>
        
        </div>
 
      </div>  
    );
}