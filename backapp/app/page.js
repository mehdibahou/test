'use client'
import Image from "next/image";
import Head from 'next/head';
import { Main } from "next/document";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import Standardpage from "./standardpage";
import Hero from "./hero";
import Standardtwo from "./standardtwo";
import Pricingcards from "./pricingcards";
import Footer from "./4_column_with_company_mission_on_dark";
import Herotwo from "./simple_centered_with_background_image";
import Headertwo from "./with_call_to_action";
import DarkKitchenFeatures from "./with_product_screenshot";
import DarkKitchenFeaturesleft from "./with_product_screenshot_on_left";
export default function Home() {
  return (
    <div className="flex flex-col justify-start items-center   ">
    <Headertwo/>
    <Herotwo/>
    <DarkKitchenFeatures/>
    <DarkKitchenFeaturesleft/>
      {/* <Standardpage/>
     <Standardtwo/> */}
     <Pricingcards/>
     <Footer/>
     </div> 
  );
}
