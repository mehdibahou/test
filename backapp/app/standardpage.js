'use client'
import Image from "next/image";
import Head from 'next/head';
import { Main } from "next/document";




export default function Standardpage() {
    return(
    <div className="w-full lg:h-screen sm:mb-6 lg:mb-0  sm:h-auto sm:p-4 flex justify-start over bg-[#f5f8ff]">
        <div className="lg:h-full   w-1/2 flex flex-col justify-center lg:items-start    gap-6 px-6">
        <h1 className=" font-bold  lg:text-5xl sm:text-3xl">
           Everything your restaurant needs to sell online
           </h1>
           <p className="">
           Montez votre boutique en ligne en quelques clics et beneficiez de tous les outils essentiels pour reussir dans l'e-commerce
           </p>
           <div className="">
           <button className="w-32 h-9 bg-[#0c725c] text-white rounded-md font-semibold">Sign in</button> 
            </div>

        </div>
        <div className="h-full w-1/2 flex justify-center items-center ">
        <Image
        src="/webpage.jpg" // Path to your image
        alt="Description of the image"
        width={300} // Desired width of the image
        height={100} // Desired height of the image
      />
        </div>
    </div>

    );

}