'use client'



export default function Header() {
    return(
        
        <div className="z-30 w-full  sm:h-[6%]   lg:h-[10%] bg-[#ffffff] flex justify-between items-center shadow-md fixed px-20 lg:px-32">
         <div className="px-2">
           <p className="text-2xl text-[#091b43] font-bold">SKEM</p>
         </div>
         <div>
          <button className="w-24 h-9  text-gray-700 rounded-md ">Pricing</button>
          <button className="w-24 h-9  text-gray-700 rounded-md ">fonctionalites</button>
          <button className="w-24 h-9  text-gray-700 rounded-md ">about us</button>


         </div>

         <div>
         <button className="w-24 h-9 bg-white text-[#0a1b43] rounded-md font-semibold">Sign in</button>
         <button className="w-32 h-9 bg-[#0c725c]  text-white rounded-md font-semibold">log in</button>
          
         </div>
        </div>
 
 
    );
}