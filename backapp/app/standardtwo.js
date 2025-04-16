'use client'
import Image from "next/image";
import Head from 'next/head';
import { Main } from "next/document";




export default function Standardtwo() {
    return(
    <div className="w-full h-screen sm:h-auto sm:p-4 flex justify-start over">
       
        <div className="h-full w-1/2  flex justify-center items-center ">
        <Image
        src="/resto.png" // Path to your image
        alt="Description of the image"
        width={300} // Desired width of the image
        height={100} // Desired height of the image
        
      />
        </div>
        <div className="h-full w-1/2 flex flex-col justify-center gap-10 px-6">
        <h1 className=" font-bold lg:text-5xl sm:text-3xl text-[#0a1b43]">
        Tous les outils e-commerce dont vous avez besoin dans un seul endroit
           </h1>
           <p className="">
           Beneficiez de tous les outils de conception, de gestion logistique, de paiement, et d'analyse dont vous avez besoin pour gérer votre commerce de manière transparente           </p>
           <button className="w-32 h-9 bg-[#0c725c] text-white rounded-md font-semibold">Sign in</button> 

        </div>


    </div>

    );

}